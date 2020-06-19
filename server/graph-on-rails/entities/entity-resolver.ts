import _ from 'lodash';

import { ResolverContext } from '../core/resolver-context';
import { Entity } from './entity';
import { EntityItem } from './entity-item';
import { EntityModule } from './entity-module';

//
//
export class EntityResolver extends EntityModule {

  get accessor() { return this.entity.accessor }

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
    const attributes = _.get( resolverCtx.args, this.entity.singular );
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
   *
   */
  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refEntity.foreignKey );
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocTo( refEntity, resolverCtx, id );
    const enit = await refEntity.findById( id );
    return enit.item;
  }

  /**
   *
   */
  private async resolvePolymorphAssocTo( refEntity:Entity, resolverCtx:ResolverContext, id:any ):Promise<any> {
    const polymorphType = this.context.entities[_.get( resolverCtx.root, refEntity.typeField )];
    const enit = await polymorphType.findById( id );
    _.set( enit.item, '__typename', polymorphType.typeName );
    return enit.item;
  }

  /**
   *
   */
  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocToMany( refEntity, resolverCtx );
    const ids = _.map( _.get( resolverCtx.root, refEntity.foreignKeys ), id => _.toString(id) );
    const enits = await refEntity.findByIds( ids );
    return _.map( enits, enit => enit.item );
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
    const fieldName = refEntity.isAssocToMany( this.entity ) ? this.entity.foreignKeys : this.entity.foreignKey;
    const attr = _.set({}, fieldName, id );
    if( refEntity.isPolymorph ) return this.resolvePolymorphAssocFromTypes( refEntity, attr );
    const enits = await refEntity.findByAttribute( attr );
    return _.map( enits, enit => enit.item );

  }

  /**
   *
   */
  private async resolvePolymorphAssocFromTypes(refEntity:Entity, attr:any ):Promise<any[]> {
    const result = [];
    for( const entity of refEntity.entities ){
      const enits = await entity.findByAttribute( attr );
      _.forEach( enits, enit => _.set(enit.item, '__typename', entity.typeName ) );
      result.push( enits );
    }
    return _(result).flatten().compact().map( enit => enit.item ).value();
  }

  /**
   *
   */
  async truncate():Promise<boolean>{
    return this.accessor.truncate();
  }

}
