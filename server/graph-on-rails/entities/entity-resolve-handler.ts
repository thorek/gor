import { ResolverContext } from 'graph-on-rails/core/resolver-context';
import _ from 'lodash';

import { Entity } from './entity';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

//
//
export class EntityResolveHandler extends EntityModule {

  get accessor() { return this.entity.entityAccessor }

  /**
   *
   */
  async resolveType( resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.args, 'id' );
    const enit = await this.accessor.findById( id );
    return enit.item;
  }

  /**
   *
   */
  async resolveTypes( resolverCtx:ResolverContext ):Promise<any[]> {
    const filter = _.get( resolverCtx.args, 'filter');
    const enits = await this.accessor.findByFilter( filter );
    return _.map( enits, enit => enit.item );
  }

  /**
   *
   */
  async saveType( resolverCtx:ResolverContext ):Promise<any> {
    const attributes = await this.getAttributes( resolverCtx );
    const result = await this.accessor.save( attributes );
    return result instanceof EntityItem ?
      _.set( {validationViolations: []}, this.entity.singular, result.item ) :
      { validationViolations: result };
  }

  /**
   *
   */
  async deleteType( resolverCtx:ResolverContext ) {
    return this.accessor.delete( resolverCtx.args.id );
  }

  /**
   * Retrieves the attributes from the ResolverContext, if an item exist (to be updated) the
   * current values are loaded and used when no values where provided
   * TODO what happens, when the user wants to delete a string value?
   * @returns map with attributes
   */
  private async getAttributes( resolverCtx:ResolverContext ):Promise<any> {
    let attributes = _.get( resolverCtx.args, this.entity.singular );
    if( ! _.has( attributes, 'id' ) ) return attributes;
    const current = await this.accessor.findById( _.get( attributes, 'id' ) );
    return _.defaultsDeep( attributes, current.item );
  }

  /**
   *
   */
  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refEntity.foreignKey );
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocTo( refEntity, resolverCtx, id );
    return refEntity.findById( id );
  }

  /**
   *
   */
  private async resolvePolymorphAssocTo( refEntity:Entity, resolverCtx:ResolverContext, id:any ):Promise<any> {
    const polymorphType = this.context.entities[_.get( resolverCtx.root, refEntity.typeField )];
    const result = await polymorphType.findById( id );
    _.set( result, '__typename', polymorphType.typeName );
    return result;
  }

  /**
   *
   */
  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocToMany( refEntity, resolverCtx );
    const ids = _.map( _.get( resolverCtx.root, refEntity.foreignKeys ), id => _.toString );
    return refEntity.findByIds( ids );
  }

  /**
   *
   */
  private async resolvePolymorphAssocToMany( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    throw 'not implemented';
  }

  /**
   *
   */
  async resolveAssocFromTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any[]> {
    const id = _.toString(resolverCtx.root.id);
    const fieldName = refEntity.isAssocToMany( this.entity ) ? refEntity.foreignKeys : refEntity.foreignKey;
    const attr = _.set({}, fieldName, id );
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocFromTypes( refEntity, attr );
    return refEntity.findByAttribute( attr );
  }

  /**
   *
   */
  private async resolvePolymorphAssocFromTypes(refEntity:Entity, attr:any ):Promise<any[]> {
    const result = [];
    for( const entity of refEntity.entities ){
      const items = await entity.findByAttribute( attr );
      _.forEach( items, item => _.set(item, '__typename', entity.typeName ) );
      result.push( items );
    }
    return _(result).flatten().compact().value();
  }

  /**
   *
   */
  async truncate():Promise<boolean>{
    return this.accessor.truncate();
  }

}
