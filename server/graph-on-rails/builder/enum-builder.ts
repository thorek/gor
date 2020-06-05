import { GraphQLEnumType } from 'graphql';
import _ from 'lodash';

import { SchemaBuilder } from './schema-builder';

export abstract class EnumBuilder extends SchemaBuilder {


  abstract enum():{[name:string]:{[key:string]:string}}


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
