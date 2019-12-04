import { GraphQLEnumType } from 'graphql';
import inflection from 'inflection';
import _ from 'lodash';

import { GraphX } from './graphx';
import { Attribute, TypeAttribute } from './type-attribute';

//
//
export type EntityReference = {
	type:string;
}

/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class SchemaType {

	abstract get name():string;
	get typeName() { return this.name ?  inflection.camelize( this.name ) : '' }
	get attributes():{[name:string]:TypeAttribute} { return {} };
	get enums():any { return {} }

	graphx!:GraphX;

	protected _attributes?:{[name:string]:Attribute};

	//
	//
	init(graphx:GraphX ):void {
		this.graphx = graphx;
		this.createEnums();
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
	protected createEnums():void {
		_.forEach( this.enums, (keyValues:any, name:string) => {
			const values = {};
			_.forEach( keyValues, (value,key) => _.set( values, key, { value }));
			this.graphx.type( name, { name, values, from: GraphQLEnumType	} );

			this.createEnumFilter( name );
		});
	}

	//
	//
	protected createEnumFilter( name:string ):void {
		this.graphx.addEnumFilterAttributeType( name );

	}

	//
	//
	protected getAttributes():{[name:string]:Attribute} {
		if( ! this._attributes ) {
			this._attributes = _.mapValues( this.attributes, attribute => new Attribute( attribute, this ) );
		}
		return this._attributes;
	}

	//
	//
	protected getAttribute( name:string): Attribute {
		return this.getAttributes()[name];
	}

}

