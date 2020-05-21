import _ from 'lodash';
import { SchemaBuilder } from "./schema-builder";
import { Resolver } from "../core/resolver";
import { GraphX } from "../core/graphx";
import { GraphQLEnumType } from 'graphql';
import { GorConfig } from '../core/gor';

export abstract class EnumBuilder extends SchemaBuilder {

	//
	//
	constructor( protected gorConfig:GorConfig ){ super() }

  abstract enum():{[name:string]:{[key:string]:string}}

  get resolver() { return this.gorConfig.resolver }

	//
	//
	init( graphx:GraphX ):void {
    super.init( graphx );
    this.resolver.init( this );
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
