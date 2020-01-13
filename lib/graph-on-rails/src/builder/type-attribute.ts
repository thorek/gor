import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLType,
} from 'graphql';
import _ from 'lodash';

import { SchemaBuilder } from './schema-builder';
import { FilterTypeBuilder } from './filter-type-builder';

//
//
export type TypeAttribute = {
	filterType?:string;
	type:string;
}

//
//
export class Attribute {

	get graphx() { return this.entity.graphx }

	//
	//
	constructor(
		public readonly attr:TypeAttribute,
		private entity:SchemaBuilder)
	{}

	//
	//
	getType():GraphQLType {
		switch( _.toLower(this.attr.type) ){
			case 'id': return GraphQLID;
			case 'string': return GraphQLString;
			case '[string]': return new GraphQLList( GraphQLString );
			case 'int': return GraphQLInt;
			case '[int]': return new GraphQLList( GraphQLInt );
			case 'float': return GraphQLFloat;
			case '[float]': return new GraphQLList( GraphQLFloat );
			case 'boolean': return GraphQLBoolean;
			case '[boolean]': return new GraphQLList( GraphQLBoolean );
			default: {
				const type = this.graphx.type( this.attr.type );
				if( ! type ) console.warn( `${this.entity.name} no such type '${this.attr.type}'` );
				return type;
			}
		};
	}

	//
	//
	getFilterInputType():GraphQLInputType|any {
		switch( _.toLower(this.attr.type) ){
			case 'id':
			case 'int': return this.graphx.type('IntFilter');
			case 'float': return this.graphx.type('FloatFilter');
			case 'boolean': return this.graphx.type('BooleanFilter');
			case 'string': return this.graphx.type('StringFilter');
			default: {
        const filterTypeName = `${this.attr.type}Filter`;
				const type = this.graphx.type( filterTypeName );
				if( type instanceof GraphQLInputObjectType ) return type;
        console.warn( `${this.entity.name} no such filter type '${filterTypeName}'` );
				return null;
			}
		};
  }

	//
	//
	getFilterAttributeType():FilterTypeBuilder | null {
		switch( _.toLower(this.attr.type) ){
			case 'id':
			case 'int': return this.graphx.filterAttributes['IntFilter']
			case 'float': return this.graphx.filterAttributes['FloatFilter']
			case 'boolean': return this.graphx.filterAttributes['BooleanFilter']
      case 'string': return this.graphx.filterAttributes['StringFilter']
			default: {
        const filterTypeName = `${this.attr.type}Filter`;
				return <FilterTypeBuilder>this.graphx.filterAttributes[filterTypeName];
			}
		};
	}

}

