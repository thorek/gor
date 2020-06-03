import { GraphQLSchema } from 'graphql';
import _ from 'lodash';

import { SchemaBuilder } from '../builder/schema-builder';
import { GraphX } from './graphx';

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
	createSchema(graphx:GraphX):GraphQLSchema {

    graphx.init();

		_.forEach( this.builders, type => type.init( graphx ) );
		_.forEach( this.builders, type => type.createTypes() );
		_.forEach( this.builders, type => type.extendTypes() );

		const schema = graphx.generate();
		return schema;
	}
}
