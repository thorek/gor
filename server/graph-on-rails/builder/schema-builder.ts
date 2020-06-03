import _ from 'lodash';

import { GraphX } from '../core/graphx';
import { TypeAttribute } from '../entities/entity';
import { Attribute } from './attribute';


/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class SchemaBuilder {


  graphx!:GraphX;
  abstract name():string;
  attributes():{[name:string]:TypeAttribute} { return {} };
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
	extendTypes():void {}

	//
	//
	protected abstract createObjectType():void;

	//
	//
	protected getAttributes():{[name:string]:Attribute} {
		if( ! this._attributes ) {
			this._attributes = _.mapValues( this.attributes(), (attribute, name) => new Attribute( name, attribute, this.graphx ) );
		}
		return this._attributes;
	}

	//
	//
	public getAttribute( name:string): Attribute {
		return this.getAttributes()[name];
  }
}

