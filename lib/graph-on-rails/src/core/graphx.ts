import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import * as _ from 'lodash';
import { EntityBuilder } from '../builder/entity-builder';
import { FilterTypeBuilder } from '../builder/filter-type-builder';
import { EnumFilterTypeBuilder } from '../filter/enum-filter-type-builder';


//
//
export class GraphX {

  readonly entities:{[name:string]:EntityBuilder} = {};
  readonly filterAttributes:{[name:string]:FilterTypeBuilder} = {};
	rawTypes:any = {};

	private fnFromArray = (fns:any) => () => fns.reduce((obj:any, fn:any) => Object.assign({}, obj, fn.call()), {});

	//
	//
	constructor(){
		this.createType('query', {
			name: 'Query',
			fields: () => ({
				ping: { type: GraphQLString, resolve: () => 'pong' }
			})
		});

		this.createType('mutation', {
			name: 'Mutation',
			fields: () => ({
				ping: {
					type: GraphQLString,
					args: {  some: { type: GraphQLString } },
					resolve: (root:any, args:any ) => `pong, ${args.some}!`
				}
			})
		});
	}

  /**
   *
   * @param name
   */
	addEnumFilterAttributeType( name:string ):void {
		const efat = new EnumFilterTypeBuilder( name );
		efat.init( this );
		efat.createTypes();
	}

	//
	//
	private createType( name:string, obj:any ){
		if (this.rawTypes[name]) throw new Error(`Type '${name}' already exists.`);
		return this.rawTypes[name] = {
			from: obj.from || GraphQLObjectType,
			name: obj.name,
			description: obj.description,
			args: obj.args,
			fields: [obj.fields],
			values: obj.values,
			extend: (fields:any) => this.rawTypes[name].fields.push(fields instanceof Function ? fields : () => fields)
		};
	}

	//
	//
	type( name:string, obj?:any ){
		if (obj === undefined) {
			if (this.rawTypes[name] === undefined) throw new Error(`Type '${name}' does not exist in this GraphX.`);
			return this.rawTypes[name];
		}
		return this.createType(name, obj);
	}

  /**
   *
   */
	generate = () => {

    this.generateMetaData();
    this.generateTypes();

		return new GraphQLSchema({
			query: this.type('query'),
			mutation: this.type('mutation')
		});
  }

  /**
   *
   */
  private generateMetaData = () => {
    const metaDataType = new GraphQLObjectType({
      name: 'metaData',
      fields: {
        name: { type: GraphQLString, resolve: (obj) => obj.name() },
        path: { type: GraphQLString, resolve: (obj) => obj.path() },
        list: { type: GraphQLString, resolve: (obj) => obj.list() },
        entity: { type: GraphQLString, resolve: (obj) => obj.entity() },
        label: { type: GraphQLString, resolve: (obj) => obj.label() },
        parent: { type: GraphQLString, resolve: (obj) => obj.parent() }
    }});

    this.type('query').extend( () => {
      return _.set( {}, 'metaData', {
        type: new GraphQLList( metaDataType ),
        resolve: (root:any) => _.values( this.entities )
			});
    });
  }

  /**
   *
   */
  private generateTypes = () => {
    _.forEach( this.rawTypes, (item, key) => {
			this.rawTypes[key] = new item.from({
				name: item.name,
				description: item.description,
				args: item.args,
				fields: this.fnFromArray(item.fields),
				values: item.values
			});
    });
  }

}

