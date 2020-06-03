import { GraphQLInputObjectType } from 'graphql';
import _ from 'lodash';

import { GraphX } from '../core/graphx';
import { SchemaBuilder } from './schema-builder';

/**
 * Base class for all Filter Attributes
 */
export abstract class FilterTypeBuilder extends SchemaBuilder {

	//
	//
	init(graphx:GraphX ):void {
		super.init( graphx );
    this.graphx.filterAttributes[`${this.name()}Filter`] = this;
	}


	//
	//
	abstract getFilterExpression( args:any, field:string ):any;

	//
	//
	protected createObjectType():void {
		const filterName = `${this.name()}Filter`;
		this.graphx.type( filterName, { name: filterName, from: GraphQLInputObjectType, fields: () => {
			const fields = {};
			this.setAttributes( fields );
			return fields;
		} });
	}

	//
	//
	extendTypes():void {}

	//
	//
	protected setAttributes( fields:any ):void {
		_.forEach( this.getAttributes(), (attribute,name) => {
			_.set( fields, name, { type: attribute.getType() } );
		});
	}

}
