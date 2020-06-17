import _ from 'lodash';

import { EntityReference } from './entity';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';
import { ValidationViolation } from './entity-validator';

//
//
export class EntityAccessor extends EntityModule {

  get dataStore() { return this.entity.resolver }

  /**
   *
   */
  async findById( id:any ):Promise<EntityItem> {
    const item = await this.dataStore.findById( this.entity, id );
    if( ! item ) throw new Error( `[${this.entity.name}] with id '${id}' does not exist`);
    return EntityItem.create( this.entity, item );
  }

  /**
   *
   */
  async findByIds( ids:any[] ):Promise<EntityItem[]> {
    const items = await this.dataStore.findByIds( this.entity, ids );
    return Promise.all( _.map( items, item => EntityItem.create( this.entity, item ) ) );
  }

  /**
   *
   */
  async findByAttribute( attrValue:{[name:string]:any} ):Promise<EntityItem[]>{
    const items = await this.dataStore.findByAttribute( this.entity, attrValue );
    return Promise.all( _.map( items, item => EntityItem.create( this.entity, item ) ) );
  }

  /**
   *
   * @param filter as it comes from the graqpql request
   */
  async findByFilter( filter:any ):Promise<EntityItem[]>{
    let expression = this.dataStore.buildExpression( this.entity, filter );
    let ids = await this.entity.getPermittedIds( "read", resolverCtx );
    expression = await this.dataStore.addPermittedIds( expression, ids  );
    return this.dataStore.findByExpression( this.entity, expression );
  }

  /**
   *
   */
  async save( attributes:any, skipValidation = false ):Promise<EntityItem|ValidationViolation[]> {
    // TODO set defaults
    if( ! skipValidation ){
      const validationViolations = await this.entity.validate( attributes );
      if( _.size( validationViolations ) ) return validationViolations;
    }
    for( const assocTo of this.entity.assocToInput ){
      await this.createInlineInput( assocTo, attributes );
    }
    const item = await this.dataStore.createType( this.entity, attributes );
    return EntityItem.create( this.entity, item );
  }

  /**
   *
   */
  delete( id:any ):Promise<boolean> {
    return this.dataStore.deleteType( this.entity, id );
  }

  /**
   *
   */
  truncate():Promise<boolean>{
    return this.dataStore.truncate( this.entity );
  }

  /**
   *
   */
  private async createInlineInput( assocTo: EntityReference, attrs: any ) {
    const refEntity = this.context.entities[assocTo.type];
    const input = _.get( attrs, refEntity.singular );
    if( ! input ) return;
    if ( _.has( attrs, refEntity.foreignKey ) ) throw new Error(
      `'${this.entity.name} you cannot have '${refEntity.foreignKey}' if you provide inline input'` );
    const item = await this.dataStore.createType( refEntity, input );
    _.set( attrs, refEntity.foreignKey, _.toString( item.id ) );
    _.unset( attrs, refEntity.singular );
  }

}
