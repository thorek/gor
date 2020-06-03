import _ from 'lodash';
import { Entity, EntityReference } from "./entity";

/**
 *
 */
export class EntitySeeder {

  get resolver() { return this.entity.resolver }
  get graphx() { return this.entity.graphx }

  /**
   *
   */
  constructor( public readonly entity:Entity ){}

    /**
   *
   */
  public async truncate():Promise<boolean> {
    return await this.resolver.dropCollection( this.entity );
  }

  /**
   *
   */
  public async seedAttributes( context:any ):Promise<any> {
    const ids = {};
    await Promise.all( _.map( this.entity.seeds, (seed, name) => this.seedInstanceAttributes( name, seed, ids, context ) ) );
    return _.set( {}, this.entity.typeName, ids );
  }

  /**
   *
   */
  private async seedInstanceAttributes( name:string, seed:any, ids:any, context:any ):Promise<any> {
    try {
      const args = _.set( {}, this.entity.singular, _.pick( seed, _.keys( this.entity.attributes ) ) );
      const entity = await this.resolver.saveEntity( this.entity, {}, args, context );
      _.set( ids, name, entity.id );
    } catch (error) {
      console.error( `Entity '${this.entity.typeName }' could not seed an instance`, seed, error );
    }
  }

  /**
   *
   */
  public async seedReferences( idsMap:any, context:any ):Promise<void> {
    await Promise.all( _.map( this.entity.seeds, async (seed, name) => {
      await Promise.all( _.map( this.entity.belongsTo, async belongsTo => {
        await this.seedReference( belongsTo, seed, idsMap, name, context );
      }));
    }));
  }

  /**
   *
   */
  private async seedReference( belongsTo: EntityReference, seed: any, idsMap: any, name: string, context:any ):Promise<void> {
    try {
      const refEntity = this.graphx.entities[belongsTo.type];
      if ( refEntity && _.has( seed, refEntity.typeName ) ) {
        const refName = _.get( seed, refEntity.typeName );
        const refId = _.get( idsMap, [refEntity.typeName, refName] );
        if ( refId ) await this.updateReference( idsMap, name, refEntity, refId, context );
      }
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, belongsTo, name, error );
    }
  }

  /**
   *
   */
  private async updateReference( idsMap: any, name: string, refEntity: Entity, refId: string, context:any ) {
    const id = _.get( idsMap, [this.entity.typeName, name] );
    const entity = await this.resolver.resolveType( this.entity, {}, { id }, context );
    _.set( entity, refEntity.foreignKey, _.toString(refId) );
    const args = _.set( {}, this.entity.singular, entity );
    await this.resolver.saveEntity( this.entity, {}, args, context );
  }


}
