import _ from 'lodash';

import { GorContext } from '../core/gor-context';
import { Entity } from './entity';

/**
 *
 */
export type AttributeConfig = {
  type:string;
  validation:any;
}

/**
 *
 */
export type EntityConfig  = {
  typeName?:string;

  attributes?:{[name:string]:string|AttributeConfig};
  belongsTo?:[string|{type:string}];
  hasMany?:string[];

	plural?:string
	singular?:string;

  collection?:string;
  instance?:string;
  label?:string;
  path?:string;
  parent?:string;

  enum:{[name:string]:{[key:string]:string}}
  seeds:{[name:string]:any}
  permissions:null|{[role:string]:boolean|string|{[action:string]:string|object|(string|object)[]}}
  equality:null|string|{[typeName:string]:string[]}
}

/**
 *
 */
export class ConfigEntity extends Entity {

  /**
   *
   */
  static create( name:string, gorContext:GorContext, entityConfig:EntityConfig ):ConfigEntity {
    return new ConfigEntity( name, gorContext, entityConfig );
  }

  /**
   *
   */
	protected  constructor(
      protected readonly _name:string,
      public readonly gorContext:GorContext,
      public readonly entityConfig:EntityConfig ){
   super( gorContext );
  }

  protected getName() { return this._name }
  protected getTypeName() { return this.entityConfig.typeName || super.getTypeName() }
  protected getAttributes() {
    if( ! this.entityConfig.attributes ) return super.getAttributes();
    return _.mapValues( this.entityConfig.attributes, attr => {
      return _.isString(attr) ? { type: attr } : attr;
    });
  }
	protected getBelongsTo() {
    if( ! this.entityConfig.belongsTo ) return super.getBelongsTo();
    return _.map( this.entityConfig.belongsTo, bt => {
      return _.isString(bt) ? { type: bt } : bt;
    });
  }
  protected getHasMany(){
    if( ! this.entityConfig.hasMany ) return super.getHasMany();
    if( ! _.isArray( this.entityConfig.hasMany ) ){
      console.warn(`'${this.name}' hasMany must be an array but is: `, this.entityConfig.hasMany );
      return super.getHasMany();
    }
    return _.map( this.entityConfig.hasMany, hm => {
      return _.isString(hm) ? { type: hm } : hm;
    });
   }
   protected getEnum(){
     if( ! this.entityConfig.enum ) return super.getEnum();
     return this.entityConfig.enum;
   }
  protected getPlural() { return this.entityConfig.plural || super.getPlural() }
	protected getSingular() { return this.entityConfig.singular || super.getSingular() }
  protected getCollection() { return this.entityConfig.collection || super.getCollection() }
  protected getLabel() { return this.entityConfig.label || super.getLabel() }
  protected getPath() { return this.entityConfig.path || super.getPath() }
  protected getParent() { return this.entityConfig.parent || super.getParent() }
  protected getSeeds() { return this.entityConfig.seeds || super.getSeeds() }
  protected getPermissions() { return this.entityConfig.permissions || super.getPermissions() }
  protected getEquality() {
    const sr = this.entityConfig.equality;
    if( ! sr ) return super.getEquality();
    return _.isString( sr ) ? _.set( {}, sr, _.map( this.belongsTo, bt => bt.type ) ) : sr;
  }
}
