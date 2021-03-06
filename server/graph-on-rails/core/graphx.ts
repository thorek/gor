import { GraphQLBoolean, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLNonNull, GraphQLType, GraphQLID, GraphQLInt, GraphQLUnionType, GraphQLInterfaceType } from 'graphql';
import _ from 'lodash';

import { Context } from './context';
import { Seeder } from './seeder';


//
//
export class GraphX {


	rawTypes:any = {};

	private fnFromArray = (fns:any) => () => fns.reduce((obj:any, fn:any) => Object.assign({}, obj, fn.call()), {});

	//
	//
	init(){
		this.createQueryType();
    this.createMutationType();
    this.createValidationViolationType();
	}

  /**
   *
   */
  private createMutationType():void {
    this.createType( 'mutation', {
      name: 'Mutation',
      fields: () => ( {
        ping: {
          type: GraphQLString,
          args: { some: { type: GraphQLString } },
          resolve: ( root: any, args: any ) => `pong, ${args.some}!`
        },
        seed: {
          type: GraphQLString,
          args: { truncate: { type: GraphQLBoolean } },
          resolve: ( root: any, args: any, context:any ) => Seeder.create(
            context.context as Context ).seed( args.truncate )
        }
      } )
    } );
  }

  /**
   *
   */
  private createQueryType():void {
    this.createType( 'query', {
      name: 'Query',
      fields: () => ( {
        ping: { type: GraphQLString, resolve: () => 'pong' }
      } )
    } );
  }

  /**
   *
   */
  private createValidationViolationType():void {
    this.createType('ValidationViolation', {
      name: 'ValidationViolation',
      fields: () => ({
        attribute: { type: GraphQLString },
        violation: { type: new GraphQLNonNull( GraphQLString ) }
      })
    });
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
      types: obj.types,
      interfaceTypes: obj.interfaceTypes,
			extendFields: (fields:any) => this.rawTypes[name].fields.push(fields instanceof Function ? fields : () => fields),
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

    this.type('query').extendFields( () => {
      return _.set( {}, 'metaData', {
        type: new GraphQLList( metaDataType ),
        resolve: (root:any, args:any, context:any) => _.values( _.get( context, 'Context.entities') )
			});
    });

  }

  /**
   *
   */
  private generateTypes = () => {
    _.forEach( this.rawTypes, (item, key) => {
      if( item.from === GraphQLUnionType ){
        this.rawTypes[key] = new GraphQLUnionType({
          name: item.name,
          types: _.map( item.types(), type => type ),
          description: item.description
        });
      } else if( item.from === GraphQLInterfaceType ){
        this.rawTypes[key] = new GraphQLInterfaceType({
          name: item.name,
          description: item.description,
          fields: this.fnFromArray(item.fields)
        });
      } else if( item.from === GraphQLObjectType ){
        this.rawTypes[key] = new GraphQLObjectType({
          name: item.name,
          description: item.description,
          fields: this.fnFromArray(item.fields),
          interfaces: item.interfaceTypes ? item.interfaceTypes() : []
        });
      } else {
        this.rawTypes[key] = new item.from({
          name: item.name,
          description: item.description,
          args: item.args,
          fields: this.fnFromArray(item.fields),
          values: item.values
			  });
      }
    });
  }

}

