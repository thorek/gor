import _ from 'lodash';

import { GraphX } from './graphx';
import { SchemaType } from './schema-type';

export class SchemaFactory {

	//
	//
	constructor( private types:SchemaType[] ){}

	//
	//
	createSchema():any {

		const graphx = new GraphX();

		_.forEach( this.types, type => type.init( graphx ) );
		_.forEach( this.types, type => type.createTypes() );
		_.forEach( this.types, type => type.extendTypes() );

		const schema = graphx.generate();
		return schema;
	}
}
