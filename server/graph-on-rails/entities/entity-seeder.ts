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
    return await this.resolver.truncate( this.entity );
  }

  /**
   *
   */
  public async seedAttributes():Promise<any> {
    const ids = {};
    await Promise.all( _.map( this.entity.seeds, (seed, name) => this.seedInstanceAttributes( name, seed, ids ) ) );
    return _.set( {}, this.entity.typeName, ids );
  }

  /**
   *
   */
  private async seedInstanceAttributes( name:string, seed:any, ids:any ):Promise<any> {
    try {
      const attrs = _.concat(
        _.keys( this.entity.attributes ),
        _.map(this.entity.assocToInput, assocTo => this.context.entities[assocTo.type].singular ),
        _.flatten( _.map( this.entity.implements, impl => _.keys( impl.attributes ) ) ) );
      const args = _.set( {}, this.entity.singular, _.pick( seed, attrs ) );
      const result:any = await this.entity.entityResolveHandler.createType( {root:{}, args, context:{}} );
      if( _.size( result.validationViolations ) ) throw new Error( result.validationViolations );
      const item = _.get( result, this.entity.singular );
      if( ! item ) throw new Error("item null")
      _.set( ids, name, item.id );
    } catch (error) {
      console.error( `Entity '${this.entity.typeName }' could not seed an instance`, seed, error );
    }
  }

  /**
   *
   */
  public async seedReferences( idsMap:any ):Promise<void> {
    await Promise.all( _.map( this.entity.seeds, async (seed, name) => {

      const assocTos = _.concat(
        this.entity.assocTo,
        _.flatten(_.map( this.entity.implements, impl => impl.assocTo )));
      await Promise.all( _.map( assocTos, async assocTo => {
        await this.seedAssocTo( assocTo, seed, idsMap, name );
      }));

      const assocToManys = _.concat(
        this.entity.assocToMany,
        _.flatten(_.map( this.entity.implements, impl => impl.assocToMany )));

      await Promise.all( _.map( assocToManys, async assocToMany => {
        await this.seedAssocToMany( assocToMany, seed, idsMap, name );
      }));
    }));
  }

  /**
   *
   */
  private async seedAssocTo( assocTo: EntityReference, seed: any, idsMap: any, name: string ):Promise<void> {
    try {
      const refEntity = this.context.entities[assocTo.type];
      if ( refEntity && _.has( seed, refEntity.typeName ) ) {
        const refName = _.get( seed, refEntity.typeName );
        let refId = undefined;
        let refType = undefined;
        if( _.isString( refName ) ){
          refId = _.get( idsMap, [refEntity.typeName, refName] );
        } else {
          refId = _.get( idsMap, [refName.type, refName.id] );
          refType = refName.type;
        }
        if ( refId ) await this.updateAssocTo( idsMap, name, refEntity, refId, refType );
      }
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocTo, name, error );
    }
  }

  /**
   *
   */
  private async seedAssocToMany( assocToMany: EntityReference, seed: any, idsMap: any, name: string ):Promise<void> {
    try {
      const refEntity = this.context.entities[assocToMany.type];
      if ( refEntity && _.has( seed, refEntity.typeName ) ) {
        let refNames:string|string[] = _.get( seed, refEntity.typeName );
        if( ! _.isArray(refNames) ) refNames = [refNames];
        const refIds = _.compact( _.map( refNames, refName => _.get( idsMap, [refEntity.typeName, refName] ) ) );
        await this.updateAssocToMany( idsMap, name, refEntity, refIds );
      }
    }
    catch ( error ) {
      console.error( `Entity '${this.entity.typeName}' could not seed a reference`, assocToMany, name, error );
    }
  }

  /**
   *
   */
  private async updateAssocTo( idsMap: any, name: string, refEntity: Entity, refId: string, refType?: string ) {
    const id = _.get( idsMap, [this.entity.typeName, name] );
    const item = await this.entity.findById( id, false );
    _.set( item, refEntity.foreignKey, _.toString(refId) );
    if( refType ) _.set( item, refEntity.typeField, refType );
    const args = _.set( {}, this.entity.singular, item );
    await this.entity.entityResolveHandler.updateType( { root:{}, args, context:{} } );
  }

  /**
   *
   */
  private async updateAssocToMany( idsMap:any, name:string, refEntity:Entity, refIds:any[] ) {
    refIds = _.map( refIds, refId => _.toString( refId ) );
    const id = _.get( idsMap, [this.entity.typeName, name] );
    const item = await this.entity.findById( id, false );
    _.set( item, refEntity.foreignKeys, refIds );
    const args = _.set( {}, this.entity.singular, item );
    await this.entity.entityResolveHandler.updateType( { root:{}, args, context:{} } );
  }


}
