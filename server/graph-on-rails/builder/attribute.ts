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

import { GraphX } from '../core/graphx';
import { FilterTypeBuilder } from './filter-type-builder';


//
//
export class Attribute {

	//
	//
	constructor(
    public readonly name:string,
		public readonly type:string|undefined,
		public readonly graphx:GraphX )
	{ }

	//
	//
	getType():GraphQLType {
    if( ! this.type ) return GraphQLString;
		switch( _.toLower(this.type) ){
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
				const type = this.graphx.type( this.type );
				if( ! type ) console.warn( `${this.name } no such type '${this.type}'` );
				return type;
			}
		};
	}

	//
	//
	getFilterInputType():GraphQLInputType|any {
    if( ! this.type ) this.graphx.type('StringFilter');
		switch( _.toLower(this.type) ){
			case 'id':
			case 'int': return this.graphx.type('IntFilter');
			case 'float': return this.graphx.type('FloatFilter');
			case 'boolean': return this.graphx.type('BooleanFilter');
			case 'string': return this.graphx.type('StringFilter');
			default: {
        const filterTypeName = `${this.type}Filter`;
				const type = this.graphx.type( filterTypeName );
				if( type instanceof GraphQLInputObjectType ) return type;
        console.warn( `${this.name} no such filter type '${filterTypeName}'` );
				return null;
			}
		};
  }

	//
	//
	getFilterAttributeType():FilterTypeBuilder | null {
    if( ! this.type ) return this.graphx.filterAttributes['StringFilter'];
		switch( _.toLower(this.type) ){
			case 'id':
			case 'int': return this.graphx.filterAttributes['IntFilter']
			case 'float': return this.graphx.filterAttributes['FloatFilter']
			case 'boolean': return this.graphx.filterAttributes['BooleanFilter']
      case 'string': return this.graphx.filterAttributes['StringFilter']
			default: {
        const filterTypeName = `${this.type}Filter`;
				return <FilterTypeBuilder>this.graphx.filterAttributes[filterTypeName];
			}
		};
	}

}

