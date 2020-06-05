import _ from 'lodash';

import { Entity } from '../entities/entity';
import { GorContext } from './gor-context';

export class Seeder {

	//
	//
	private constructor( private entities:Entity[] ){}

  /**
   *
   */
  static create( context:GorContext ):Seeder {
    return new Seeder( _.values(context.entities) );
  }

	//
	//
  async seed( truncate:boolean, context:any ):Promise<number> {
    const entities = _.filter( this.entities, entity => ( entity instanceof Entity ) ) as Entity[];
    if( truncate ) await Promise.all( _.map( entities, async entity => await entity.entitySeeder.truncate() ) );
    const idsMap = {};
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.entitySeeder.seedAttributes( context) ) ) );
    await Promise.all( _.map( entities, async entity => _.merge( idsMap, await entity.entitySeeder.seedReferences( idsMap, context ) ) ) );
    return _.sum( _.map( idsMap, entityIdsMap => _.size( _.values( entityIdsMap ) ) ) );
	}
}
