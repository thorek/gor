import { GraphQLInputObjectType, GraphQLType } from 'graphql';
import _ from 'lodash';

import { GorContext } from '../core/gor-context';
import { SchemaBuilder } from './schema-builder';

export interface FilterExpressionBuilder {
  getFilterExpression( args:any, field:string ):any;
}

/**
 * Base class for all Filter Attributes
 */
export abstract class FilterType extends SchemaBuilder implements FilterExpressionBuilder {

  //
  //
  static getFilterName( type:string ):string { return `${type}Filter` }

  //
  //
  name() { return FilterType.getFilterName( _.get(this.graphqlType(), "name") ) }

	//
	//
	init( context:GorContext ):void {
    super.init( context );
    _.set( context.filterTypes, this.name(), this );
	}

  //
  //
  abstract graphqlType():GraphQLType;

  //
  //
  abstract getFilterExpression( args:any, field:string ):any;

	//
	//
	protected createObjectType():void {
		const filterName = this.name();
		this.graphx.type( filterName, {
      name: filterName,
      from: GraphQLInputObjectType,
      fields: () => {
        const fields = {};
        this.setAttributes( fields );
        return fields;
      }
     });
	}

	//
	//
	extendTypes():void {}

	//
	//
	protected setAttributes( fields:any ):void {
		_.forEach( this.attributes(), (attribute,name) => {
			_.set( fields, name, { type: attribute.graphqlType } );
		});
	}

}
