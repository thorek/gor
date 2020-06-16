import _ from 'lodash';

import { Validator } from '../validation/validator';
import { Entity, EntityReference } from './entity';
import { TypeAttribute } from './type-attribute';
import { ResolverContext } from '../core/resolver-context';

//
//
export type ValidationViolation = {
  attribute?: string,
  violation: string
}

//
//
export class EntityValidator  {

  private validator!:Validator;
  get context() { return this.entity.context }
  get resolver() { return this.context.resolver }

  constructor( public readonly entity:Entity ){
    this.validator = entity.context.validator( entity );
  }

  /**
   *
   */
  async validate( resolverCtx:ResolverContext ):Promise<ValidationViolation[]> {
    const attributes = await this.getAttributes( resolverCtx.args );
    const violations:ValidationViolation[] = [];
    violations.push( ... await this.validateRequiredAssocTos( attributes ) );
    violations.push( ... await this.validateUniqe( attributes, resolverCtx ) );
    violations.push( ... await this.validator.validate( attributes, resolverCtx ) );
    return violations;
  }

  /**
   *
   */
  private async getAttributes( args:any ):Promise<any> {
    let attrs = _.get( args, this.entity.singular );
    if( ! _.has( attrs, 'id' ) ) return attrs;
    const current = await this.resolver.findById( this.entity, _.get( attrs, 'id' ) );
    return _.defaultsDeep( attrs, current );
  }

  /**
   *
   */
  private async validateRequiredAssocTos( attributes:any ):Promise<ValidationViolation[]> {
    const violations:ValidationViolation[] = [];
    for( const assocTo of this.entity.assocTo ){
      if( ! assocTo.required ) continue;
      const violation = await this.validateRequiredAssocTo( assocTo, attributes );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateRequiredAssocTo( assocTo:EntityReference, attributes:any ):Promise<ValidationViolation|undefined> {
    const refEntity = this.context.entities[assocTo.type];
    const foreignKey = _.get( attributes, refEntity.foreignKey );
    if( ! foreignKey ) return {attribute: refEntity.foreignKey, violation: "must be provided"};
    try {
      const result = await refEntity.findById( _.toString(foreignKey) );
      if( result ) return;
    } catch (error) {
      return { attribute: refEntity.foreignKey, violation: _.toString(error) };
    }
    return { attribute: refEntity.foreignKey, violation: "must refer to existing item" };
  }


  /**
   *
   */
  private async validateUniqe( attributes:any, resolverCtx:ResolverContext ):Promise<ValidationViolation[]> {
    const violations:ValidationViolation[] = [];
    for( const name of _.keys(this.entity.attributes) ){
      const attribute = this.entity.attributes[name];
      if( ! attribute.unique ) continue;
      const violation = await this.validateUniqeAttribute( name, attribute, attributes, resolverCtx );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateUniqeAttribute( name:string, attribute:TypeAttribute, attributes:any, resolverCtx:ResolverContext ):Promise<ValidationViolation|undefined> {
    const value = _.get( attributes, name );
    if( _.isUndefined( value ) ) return;
    const attrValues = _.set({}, name, value );
    let scopeMsg = "";
    if( _.isString( attribute.unique ) ){
      const scopeEntity = this.context.entities[attribute.unique];
      const scope = scopeEntity ? scopeEntity.foreignKey : attribute.unique;
      const scopeValue = _.get( attributes, scope );
      _.set(attrValues, scope, scopeValue );
      scopeMsg = ` within scope '${attribute.unique}'`;
    }
    const result = await this.entity.findByAttribute( attrValues );
    const violation = {attribute: name, violation: `value '${value}' must be unique` + scopeMsg }
    return this.isUniqueResult( attributes, result ) ? undefined : violation;
  }

  /**
   *
   */
  isUniqueResult( attributes:any, result:any[] ):boolean {
    if( _.size( result ) === 0 ) return true;
    if( _.size( result ) > 1 ) return false;
    const currentId = _.toString( _.get( attributes, "id" ) );
    return currentId === _.toString( _.get( _.first(result), 'id') );
  }


}
