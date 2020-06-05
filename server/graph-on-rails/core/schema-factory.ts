import { GraphQLSchema } from 'graphql';
import _ from 'lodash';

import { SchemaBuilder } from '../builder/schema-builder';
import { GorContext } from './gor-context';

export class SchemaFactory {

	//
	//
	private constructor( private builders:SchemaBuilder[] ){}

  /**
   *
   */
  static create( builders:SchemaBuilder[] ):SchemaFactory {
    return new SchemaFactory( builders );
  }

	//
	//
	createSchema(context:GorContext):GraphQLSchema {

    context.graphx.init();

		_.forEach( this.builders, type => type.init( context ) );
		_.forEach( this.builders, type => type.createTypes() );
		_.forEach( this.builders, type => type.extendTypes() );

		const schema = context.graphx.generate();
		return schema;
	}
}
