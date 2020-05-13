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
	async seed( truncate:boolean ):Promise<number> {
    const entities = _.filter( this.types, type => ( type instanceof EntityBuilder ) ) as EntityBuilder[];
    if( truncate ) await Promise.all( _.map( entities, async entity => await entity.truncate() ) );
    const idsMap = {};
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.seedAttributes() ) ) );
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.seedReferences( idsMap ) ) ) );
    return _.sum( _.map( idsMap, entityIdsMap => _.size( _.values( entityIdsMap ) ) ) );
	}
}
