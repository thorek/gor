import _ from 'lodash';

import { GraphX } from '../core/graphx';
import { TypeAttribute } from '../entities/entity';
import { Attribute } from './attribute';
import { GorContext } from '../core/gor-context';


/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export abstract class SchemaBuilder {

  private _context!:GorContext;
  get context() { return this._context }
  get graphx() {return this.context.graphx };
  get resolver() {return this.context.resolver };

  abstract name():string;
  attributes():{[name:string]:TypeAttribute} { return {} };
	protected _attributes?:{[name:string]:Attribute};

	//
	//
	init( context:GorContext ):void {
    this._context = context;
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

