import _ from 'lodash';
import { EntityModule } from "./entity-module";
import { ResolverContext } from "graph-on-rails/core/resolver-context";
import { Entity } from './entity';

export class EntityResolveHandler extends EntityModule {


  get resolver() { return this.entity.resolver }

  /**
   *
   */
  async findById( id:any ):Promise<any> {
    return this.resolver.findById( this.entity, id );
  }


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
    const item = await this.entity.resolver.resolveType( this.entity, resolverCtx );
    return await this.resolveVirtualAttributes( resolverCtx, item );
  }

  /**
   *
   */
  async resolveTypes( resolverCtx:ResolverContext ):Promise<any> {
    const items = await this.entity.resolver.resolveTypes( this.entity, resolverCtx );
    for( const item of items ) await this.resolveVirtualAttributes( resolverCtx, item );
    return items;
  }

  /**
   *
   */
  async findByAttribute( attrValue:{[name:string]:any}, resolverCtx?:ResolverContext ):Promise<any[]>{
  if( ! resolverCtx ) resolverCtx = { root:{}, args:{}, context:{} };
    const items = await this.entity.resolver.findByAttribute( this.entity, attrValue );
    for( const item of items ) await this.resolveVirtualAttributes( resolverCtx, item );
    return items;
  }

  /**
   *
   */
  private async resolveVirtualAttributes( resolverCtx:ResolverContext, item:any ):Promise<any> {
    for( const name of _.keys(this.entity.attributes) ){
      const attribute = this.entity.attributes[name];
      if( attribute.virtual ) await this.resolveVirtualAttribute( resolverCtx, item, name );
    }
  }

  /**
   *
   */
  private async resolveVirtualAttribute( resolverCtx:ResolverContext, item:any, name:string ):Promise<void> {
    const resolver = _.get( this.context.virtualResolver, [this.entity.name, name] );
    const value = resolver ?
      await Promise.resolve( resolver(resolverCtx, { entity: this.entity, item } ) ) :
      `[no resolver for '${this.entity.name}:${name}' provided]`;
    _.set( item, name, value);
  }

}
