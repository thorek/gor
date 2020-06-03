import { GraphQLEnumType } from 'graphql';
import _ from 'lodash';

import { GraphX } from '../core/graphx';
import { SchemaBuilder } from './schema-builder';
import { GorContext } from '../core/gor-context';

export abstract class EnumBuilder extends SchemaBuilder {

	//
	//
	constructor( protected gorContext:GorContext ){ super() }

  abstract enum():{[name:string]:{[key:string]:string}}

  get resolver() { return this.gorContext.resolver() }

	//
	//
	init( graphx:GraphX ):void {
    super.init( graphx );
	}

  protected createObjectType(): void {
    const name = this.name();
    const values = {};
    _.forEach( this.enum(), (value,key) => _.set( values, key, { value }));
    this.graphx.type( name, { name, values, from: GraphQLEnumType	} );
    this.createEnumFilter( name );
  }

	//
	//
	protected createEnumFilter( name:string ):void {
		this.resolver.addEnumFilterAttributeType( name, this.graphx );
	}


}
