import _ from 'lodash';
import { EntityModule } from "./entity-module";
import { ResolverContext } from "graph-on-rails/core/resolver-context";
import { Entity } from './entity';

//
//
export class EntityResolveHandler extends EntityModule {

  get resolver() { return this.entity.resolver }

  /**
   *
   */
  async createType( resolverCtx:ResolverContext ) {
    // TODO set defaults
    let validationViolations = await this.entity.validate( resolverCtx );
    if( _.size( validationViolations ) ) return { validationViolations };
    const item = await this.entity.resolver.saveEntity( this.entity, resolverCtx );
    return _.set( {validationViolations: []}, this.entity.singular, item );
  }

  /**
   *
   */
  async updateType( resolverCtx:ResolverContext ) {
    // TODO set defaults
    let validationViolations = await this.entity.validate( resolverCtx );
    if( _.size( validationViolations ) ) return { validationViolations };
    return _.set( {validationViolations: []}, this.entity.singular, this.entity.resolver.saveEntity( this.entity, resolverCtx ) );
  }

  /**
   *
   */
  async deleteType( resolverCtx:ResolverContext ) {
    return this.resolver.deleteEntity( this.entity, resolverCtx );
  }

  /**
   *
   */
  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    return this.resolver.resolveAssocToType( refEntity, resolverCtx );
  }

  /**
   *
   */
  async resolveAssocFromTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    return this.resolver.resolveAssocFromTypes( this.entity, refEntity, resolverCtx );
  }

  /**
   *
   */
  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    return this.resolver.resolveAssocToManyTypes( this.entity, refEntity, resolverCtx );
  }

  /**
   *
   */
  async resolveType( resolverCtx:ResolverContext ):Promise<any> {
    return await this.entity.resolver.resolveType( this.entity, resolverCtx );
  }

  /**
   *
   */
  async resolveTypes( resolverCtx:ResolverContext ):Promise<any> {
    const items = await this.entity.resolver.resolveTypes( this.entity, resolverCtx );
    return items;
  }



}
