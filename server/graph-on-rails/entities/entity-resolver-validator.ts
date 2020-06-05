import _ from 'lodash';
import { Entity, TypeAttribute, EntityReference } from './entity';

//
//
export class EntityResolverValidator  {

  private constructor(){}

  static getInstance() { return new EntityResolverValidator() }

  /**
   *
   */
  async validate( entity:Entity, root:any, args:any, context:any ):Promise<string[]> {
    const violations:string[] = [];
    violations.push( ... await this.validateRequiredAssocTos( entity, root, args, context ) );
    violations.push( ... await this.validateUniqe( entity, root, args, context ) );
    return violations;
  }

  /**
   *
   */
  private async validateRequiredAssocTos( entity:Entity, root:any, args:any, context:any ):Promise<string[]> {
    const violations:string[] = [];
    for( const assocTo of entity.assocTo ){
      if( ! assocTo.required ) continue;
      const violation = await this.validateRequiredAssocTo( entity, assocTo, root, args, context );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateRequiredAssocTo( entity:Entity, assocTo:EntityReference, root:any, args:any, context:any ):Promise<string|undefined> {
    const refEntity = entity.context.entities[assocTo.type];
    const foreignKey = _.get( args, [entity.singular, refEntity.foreignKey ] );
    if( ! foreignKey ) return `${refEntity.foreignKey} must be provided`;
    try {
      const result = await entity.context.resolver.resolveType( refEntity, {}, { id: foreignKey }, {} );
      if( _.size( result ) ) return;
    } catch (error) {
      return `${refEntity.foreignKey} ${error}`;
    }
    return `${refEntity.foreignKey} must refer to existing item`;
  }


  /**
   *
   */
  private async validateUniqe( entity:Entity, root:any, args:any, context:any ):Promise<string[]> {
    const violations:string[] = [];
    for( const name of _.keys(entity.attributes) ){
      const attribute = entity.attributes[name];
      if( ! attribute.unique ) continue;
      const violation = await this.validateUniqeAttribute( entity, name, attribute, root, args, context );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateUniqeAttribute( entity:Entity, name:string, attribute:TypeAttribute, root:any, args:any, context:any ):Promise<string|undefined> {
    const value = _.get( args, [entity.singular,name] );
    if( _.isUndefined( value ) ) return;
    const result = await entity.resolver.findByAttribute( entity, name, value );
    if( _.size( result ) ) return `${name} - value '${value}' must be unique`;
  }


}