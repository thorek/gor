import { GraphQLEnumType } from 'graphql';
import inflection from 'inflection';
import _ from 'lodash';

import { GraphX } from '../core/graphx';
import { Attribute, TypeAttribute } from './type-attribute';

//
//
export type EntityReference = {
	type:string;
}

/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class SchemaBuilder {

	abstract name():string;
	typeName() { return inflection.camelize( this.name() ) }
	attributes():{[name:string]:TypeAttribute} { return {} };

	graphx!:GraphX;

	protected _attributes?:{[name:string]:Attribute};


	//
	//
	init(graphx:GraphX ):void {
    this.graphx = graphx;
	}

	//
	//
	createTypes():void { this.createObjectType(); }

	//
	//
	abstract extendTypes():void;

	//
	//
	protected abstract createObjectType():void;

	//
	//
	protected getAttributes():{[name:string]:Attribute} {
		if( ! this._attributes ) {
			this._attributes = _.mapValues( this.attributes(), attribute => new Attribute( attribute, this ) );
		}
		return this._attributes;
	}

	//
	//
	public getAttribute( name:string): Attribute {
		return this.getAttributes()[name];
	}

}

