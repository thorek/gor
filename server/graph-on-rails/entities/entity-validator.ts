import _ from 'lodash';
import { Entity, TypeAttribute, EntityReference } from './entity';
import { Validator } from '../validation/validator';

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
  async validate( root:any, args:any, context:any ):Promise<string[]> {
    const attributes = await this.getAttributes( args );
    const violations:string[] = [];
    violations.push( ... await this.validateRequiredAssocTos( attributes ) );
    violations.push( ... await this.validateUniqe( attributes ) );
    violations.push( ... await this.validator.validate( attributes, root, args, context ) );
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
  private async validateRequiredAssocTos( attributes:any ):Promise<string[]> {
    const violations:string[] = [];
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
  private async validateRequiredAssocTo( assocTo:EntityReference, attributes:any ):Promise<string|undefined> {
    const refEntity = this.context.entities[assocTo.type];
    const foreignKey = _.get( attributes, refEntity.foreignKey );
    if( ! foreignKey ) return `${refEntity.foreignKey} must be provided`;
    try {
      const result = await this.resolver.resolveType( refEntity, {}, { id: foreignKey }, {} );
      if( _.size( result ) ) return;
    } catch (error) {
      return `${refEntity.foreignKey} ${error}`;
    }
    return `${refEntity.foreignKey} must refer to existing item`;
  }


  /**
   *
   */
  private async validateUniqe( attributes:any ):Promise<string[]> {
    const violations:string[] = [];
    for( const name of _.keys(this.entity.attributes) ){
      const attribute = this.entity.attributes[name];
      if( ! attribute.unique ) continue;
      const violation = await this.validateUniqeAttribute( name, attribute, attributes );
      if( violation ) violations.push( violation );
    }
    return violations;
  }

  /**
   *
   */
  private async validateUniqeAttribute( name:string, attribute:TypeAttribute, attributes:any ):Promise<string|undefined> {
    const value = _.get( attributes, name );
    if( _.isUndefined( value ) ) return;
    const attrValues = [{name, value}];
    let scopeMsg = "";
    if( _.isString( attribute.unique ) ){
      const scopeEntity = this.context.entities[attribute.unique];
      const scope = scopeEntity ? scopeEntity.foreignKey : attribute.unique;
      const scopeValue = _.get( attributes, scope );
      attrValues.push({name:scope, value:scopeValue});
      scopeMsg = ` within scope '${attribute.unique}'`;
    }
    const result = await this.resolver.findByAttribute( this.entity, ...attrValues );
    return this.isUniqueResult( attributes, result ) ? undefined : `${name} - value '${value}' must be unique` + scopeMsg;
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
