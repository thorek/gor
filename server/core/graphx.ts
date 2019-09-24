import _ from 'lodash';
import { GraphQLString, GraphQLObjectType, GraphQLSchema, GraphQLEnumType, GraphQLInputObjectType, GraphQLList } from "graphql";
import { EntityType } from '../core/entity-type';
import { FilterAttributeType } from '../core/filter-attribute-type';
import { EnumFilterAttributeType } from '../filter-attributes/enum-filter-attribute.type';

//
//
export class GraphX {

  readonly entities:{[name:string]:EntityType} = {};
  readonly filterAttributes:{[name:string]:FilterAttributeType} = {};
  readonly menuItems:string[] = [];
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

	addEnumFilterAttributeType( name:string ):void {
		const type = new EnumFilterAttributeType( name );
		type.init( this );
		type.createTypes();
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

	//
	//
	generate = () => {

    this.type('query').extend( () => {
      const query = {};
			_.set( query, 'menuItems', {
				type: new GraphQLList( GraphQLString ),
				resolve: () => _.compact( this.menuItems )
			});
			return query;
    });

		for (let key in this.rawTypes) {
			let item = this.rawTypes[key];
			this.rawTypes[key] = new item.from({
				name: item.name,
				description: item.description,
				args: item.args,
				fields: this.fnFromArray(item.fields),
				values: item.values
			});
		}
		let schema = new GraphQLSchema({
			query: this.type('query'),
			mutation: this.type('mutation')
		});

		return schema;
	}

}

