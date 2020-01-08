import _ from 'lodash';

import { GraphX } from './graphx';
import { GraphQLSchema } from 'graphql';
import { SchemaBuilder } from '../builder/schema-builder';

export class SchemaFactory {

	//
	//
	constructor( private types:SchemaBuilder[] ){}

	//
	//
	createSchema():GraphQLSchema {

		const graphx = new GraphX();

		_.forEach( this.types, type => type.init( graphx ) );
		_.forEach( this.types, type => type.createTypes() );
		_.forEach( this.types, type => type.extendTypes() );

		const schema = graphx.generate();
		return schema;
	}
}
