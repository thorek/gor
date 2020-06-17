import _ from 'lodash';
import { EntityModule } from "./entity-module";
import { ResolverContext } from "graph-on-rails/core/resolver-context";
import { Entity, EntityReference } from './entity';

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
    const attrs = _.get( resolverCtx.args, this.entity.singular );
    for( const assocTo of this.entity.assocToInput ){
      await this.addInlineInput( assocTo, attrs, resolverCtx );
    }
    const item = await this.resolver.createType( this.entity, attrs, resolverCtx );
    return _.set( {validationViolations: []}, this.entity.singular, item );
  }

  /**
   *
   */
  private async addInlineInput( assocTo: EntityReference, attrs: any, resolverCtx:ResolverContext ) {
    const refEntity = this.context.entities[assocTo.type];
    const input = _.get( attrs, refEntity.singular );
    if( ! input ) return;
    if ( _.has( attrs, refEntity.foreignKey ) ) throw new Error(
      `'${this.entity.name} you cannot have '${refEntity.foreignKey}' if you provide inline input'` );
    const item = await this.resolver.createType( refEntity, input, resolverCtx );
    _.set( attrs, refEntity.foreignKey, _.toString( item.id ) );
    _.unset( attrs, refEntity.singular );
  }

  /**
   *
   */
  async updateType( resolverCtx:ResolverContext ) {
    // TODO set defaults
    let validationViolations = await this.entity.validate( resolverCtx );
    if( _.size( validationViolations ) ) return { validationViolations };
    const attrs = _.get( resolverCtx.args, this.entity.singular );
    const item = await this.resolver.updateType( this.entity, attrs, resolverCtx );
    return _.set( {validationViolations: []}, this.entity.singular, item );
  }

  /**
   *
   */
  async deleteType( resolverCtx:ResolverContext ) {
    return this.resolver.deleteType( this.entity, resolverCtx );
  }

  /**
   *
   */
  async resolveAssocToType( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.root, refEntity.foreignKey );
    if( refEntity.isPolymorph ) {
      const polymorphType = this.context.entities[_.get( resolverCtx.root, refEntity.typeField )];
      const result = await this.resolver.findById( polymorphType, id );
      _.set( result, '__typename', polymorphType.typeName );
      return result;
    }
    return this.resolver.findById( refEntity, id );
  }

  /**
   *
   */
  async resolveAssocFromTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const entities = refEntity.isPolymorph ? refEntity.entities : [refEntity];
    const result:any[] = [];
    const id = _.toString(resolverCtx.root.id);
    for( const entity of entities ){
      const fieldName = entity.isAssocToMany( this.entity ) ? entity.foreignKeys : entity.foreignKey;
      const attr = _.set({}, fieldName, id );
      const items = await this.resolver.findByAttribute( entity, attr );
      if( refEntity.isPolymorph ) _.forEach( items, item => _.set(item, '__typename', entity.typeName ) );
      result.push( items );
    }
    return _.compact( _.flatten( result ) );
  }

  /**
   *
   */
  async resolveAssocToManyTypes( refEntity:Entity, resolverCtx:ResolverContext ):Promise<any> {
    const foreignKeys = _.get( resolverCtx.root, refEntity.foreignKeys );
    return this.resolver.findByIds( refEntity, foreignKeys );
  }

  /**
   *
   */
  async resolveType( resolverCtx:ResolverContext ):Promise<any> {
    const id = _.get( resolverCtx.args, 'id' );
    return this.resolver.findById( this.entity, id );
  }

  /**
   *
   */
  async resolveTypes( resolverCtx:ResolverContext ):Promise<any> {
    const items = await this.entity.resolver.resolveTypes( this.entity, resolverCtx );
    return items;
  }

  /**
   *
   */
  async truncate():Promise<boolean>{
    return this.resolver.truncate( this.entity );
  }

}
