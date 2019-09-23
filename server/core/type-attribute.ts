import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLType,
} from 'graphql';
import _ from 'lodash';

import { SchemaType } from './schema-type';
import { FilterAttributeType } from './filter-attribute-type';

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
		private entity:SchemaType)
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
				const type = this.graphx.type( this.attr.type );
				if( ! type ) console.warn( `${this.entity.name} no such type '${this.attr.type}'` );
				if( type instanceof GraphQLEnumType ) return this.graphx.type('GenderFilter');
				return null;
			}
		};
	}

	//
	//
	getFilterAttributeType():FilterAttributeType | null {
		switch( _.toLower(this.attr.type) ){
			case 'id': 
			case 'int': return <FilterAttributeType>this.graphx.filterAttributes['IntFilter']
			case 'float': return <FilterAttributeType>this.graphx.filterAttributes['FloatFilter']
			case 'boolean': return <FilterAttributeType>this.graphx.filterAttributes['BooleanFilter']
			case 'string': return <FilterAttributeType>this.graphx.filterAttributes['StringFilter']
			default: {
				return <FilterAttributeType>this.graphx.filterAttributes['GenderFilter']
			}
		};		
	}

}

