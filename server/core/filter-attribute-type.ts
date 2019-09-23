import { GraphQLInputObjectType } from 'graphql';
import _ from 'lodash';

import { GraphX } from './graphx';
import { SchemaType } from './schema-type';

//
//
export abstract class FilterAttributeType extends SchemaType {

	//
	//
	init(graphx:GraphX ):void {
		super.init( graphx );
		this.graphx.filterAttributes[`${this.name}Filter`] = this;
	}


	//
	//
	abstract getFilterExpression( args:any, field:string ):any;

	//
	//
	protected createObjectType():void {
		const filterName = `${this.typeName}Filter`;
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
