import _ from 'lodash';

import { SchemaBuilder } from '../builder/schema-builder';
import { EntityBuilder } from '../builder/entity-builder';

export class Seeder {

	//
	//
	private constructor( private types:SchemaBuilder[] ){}

  /**
   *
   */
  static create( types:SchemaBuilder[] ):Seeder {
    return new Seeder( types );
  }

	//
	//
	seed():void {
    const entities = _.filter( this.types, type => ( type instanceof EntityBuilder ) );
		_.forEach( entities, type => (type as EntityBuilder).seed() );
	}
}
