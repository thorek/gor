import { GraphQLType } from 'graphql';
import _ from 'lodash';

import { GorContext } from '../core/runtime-context';
import { TypeAttribute } from '../entities/type-attribute';

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

  //
  //
  static getFilterName( type:string ):string { return `${type}Filter` }

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
	public attribute( name:string):TypeAttribute {
		return this.attributes()[name];
  }

  /**
   *
   */
  getFilterType( attr:TypeAttribute):GraphQLType|undefined {
    if( attr.filterType === false ) return;
    if( ! attr.filterType ){
      const typeName = _.isString( attr.graphqlType ) ? attr.graphqlType : _.get(attr.graphqlType, 'name' ) as string;
      attr.filterType = SchemaBuilder.getFilterName( typeName );
    }
    if( ! _.isString( attr.filterType ) ) return attr.filterType;
    try {
      return this.context.graphx.type(attr.filterType);
    } catch (error) {
      console.error(`no such filterType - skipping filter`, attr.filterType );
    }
  }
}

