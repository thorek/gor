import _ from 'lodash';

import { GorConfig } from '../core/gor';
import { EntityBuilder } from './entity-builder';

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
export class EntityConfigBuilder extends EntityBuilder {

  /**
   *
   */
  static create( name:string, gorConfig:GorConfig, entityConfig:EntityConfig ):EntityConfigBuilder {
    return new EntityConfigBuilder( name, gorConfig, entityConfig );
  }

  /**
   *
   */
	protected constructor(
      protected readonly _name:string,
      public readonly gorConfig:GorConfig,
      public readonly entityConfig:EntityConfig ){
    super( gorConfig );
  }

  name() { return this._name }
  typeName() { return this.entityConfig.typeName || super.typeName() }

  attributes() {
    if( ! this.entityConfig.attributes ) return super.attributes();
    return _.mapValues( this.entityConfig.attributes, attr => {
      return _.isString(attr) ? { type: attr } : attr;
    });
  }

	belongsTo() {
    if( ! this.entityConfig.belongsTo ) return super.belongsTo();
    return _.map( this.entityConfig.belongsTo, bt => {
      return _.isString(bt) ? { type: bt } : bt;
    });
  }

  hasMany(){
    if( ! this.entityConfig.hasMany ) return super.hasMany();
    if( ! _.isArray( this.entityConfig.hasMany ) ){
      console.warn(`'${this.name()}' hasMany must be an array but is: `, this.entityConfig.hasMany );
      return super.hasMany();
    }
    return _.map( this.entityConfig.hasMany, hm => {
      return _.isString(hm) ? { type: hm } : hm;
    });
   }

   enum(){
     if( ! this.entityConfig.enum ) return super.enum();
     return this.entityConfig.enum;
   }

  plural() { return this.entityConfig.plural || super.plural() }
	singular() { return this.entityConfig.singular || super.singular() }

  collection() { return this.entityConfig.collection || super.collection() }
  instance() { return this.entityConfig.instance || super.instance() }
  label() { return this.entityConfig.label || super.label() }
  path() { return this.entityConfig.path || super.path() }
  parent() { return this.entityConfig.parent || super.parent() }
  seeds() { return this.entityConfig.seeds || super.seeds() }

  permissions() { return this.entityConfig.permissions || super.permissions() }

  equality() {
    const sr = this.entityConfig.equality;
    if( ! sr ) return super.equality();
    return _.isString( sr ) ? _.set( {}, sr, _.map( this.belongsTo(), bt => bt.type ) ) : sr;
  }
}
