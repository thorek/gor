import _ from 'lodash';

import { Entity, EntityReference } from './entity';
import { EntityModule } from './entity-module';

/**
 *
 */
export class EntitySeeder extends EntityModule {

  get resolver() { return this.context.resolver }

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
      await Promise.all( _.map( this.entity.assocTo, async assocTo => {
        await this.seedAssocTo( assocTo, seed, idsMap, name, context );
      }));
      await Promise.all( _.map( this.entity.assocToMany, async assocToMany => {
        await this.seedAssocToMany( assocToMany, seed, idsMap, name, context );
      }));
    }));
  }

  /**
   *
   */
  private async seedAssocTo( assocTo: EntityReference, seed: any, idsMap: any, name: string, context:any ):Promise<void> {
    try {
      const refEntity = this.context.entities[assocTo.type];
      if ( refEntity && _.has( seed, refEntity.typeName ) ) {
        const refName = _.get( seed, refEntity.typeName );
        const refId = _.get( idsMap, [refEntity.typeName, refName] );
        if ( refId ) await this.updateAssocTo( idsMap, name, refEntity, refId, context );
      }
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocTo, name, error );
    }
  }

  /**
   *
   */
  private async seedAssocToMany( assocToMany: EntityReference, seed: any, idsMap: any, name: string, context:any ):Promise<void> {
    try {
      const refEntity = this.context.entities[assocToMany.type];
      if ( refEntity && _.has( seed, refEntity.typeName ) ) {
        const refNames:string[] = _.get( seed, refEntity.typeName );
        // const refId =
        const refIds = _.compact( _.map( refNames, refName => _.get( idsMap, [refEntity.typeName, refName] ) ) );
        await this.updateAssocToMany( idsMap, name, refEntity, refIds, context );
      }
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocToMany, name, error );
    }
  }


  /**
   *
   */
  private async updateAssocTo( idsMap: any, name: string, refEntity: Entity, refId: string, context:any ) {
    const id = _.get( idsMap, [this.entity.typeName, name] );
    const entity = await this.resolver.resolveType( this.entity, {}, { id }, context );
    _.set( entity, refEntity.foreignKey, _.toString(refId) );
    const args = _.set( {}, this.entity.singular, entity );
    await this.resolver.saveEntity( this.entity, {}, args, context );
  }

  /**
   *
   */
  private async updateAssocToMany( idsMap:any, name:string, refEntity:Entity, refIds:any[], context:any ) {
    refIds = _.map( refIds, refId => _.toString( refId ) );
    const id = _.get( idsMap, [this.entity.typeName, name] );
    const entity = await this.resolver.resolveType( this.entity, {}, { id }, context );
    _.set( entity, refEntity.foreignKeys, refIds );
    const args = _.set( {}, this.entity.singular, entity );
    await this.resolver.saveEntity( this.entity, {}, args, context );
  }


}
