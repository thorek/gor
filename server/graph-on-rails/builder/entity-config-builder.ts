import _ from 'lodash';
import { EntityBuilder } from './entity-builder';
import { Resolver } from '../core/resolver';
import { ValidatorFactory } from '../validation/validator';

/**
 *
 */
export type AttributeConfig = { 
  type:string;
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
}

/**
 *
 */
export class EntityConfigBuilder extends EntityBuilder {

  /**
   *
   */
  static create( name:string, resolver:Resolver, validatorFactory:ValidatorFactory, config:EntityConfig ):EntityConfigBuilder {
    return new EntityConfigBuilder( name, resolver, validatorFactory, config );
  }

  /**
   *
   */
	protected constructor(
      protected readonly _name:string,
      protected readonly resolver:Resolver,
      validatorFactory:ValidatorFactory,
      protected readonly config:EntityConfig ){
    super( resolver, validatorFactory );
  }

  name() { return this._name }
  typeName() { return this.config.typeName || super.typeName() }

  attributes() {
    if( ! this.config.attributes ) return super.attributes();
    return _.mapValues( this.config.attributes, attr => {
      return _.isString(attr) ? { type: attr } : attr;
    });
  }

	belongsTo() { 
    if( ! this.config.belongsTo ) return super.belongsTo();
    return _.map( this.config.belongsTo, bt => {
      return _.isString(bt) ? { type: bt } : bt;
    });
  }

  hasMany(){
    if( ! this.config.hasMany ) return super.hasMany();
    if( ! _.isArray( this.config.hasMany ) ){
      console.warn(`'${this.name()}' hasMany must be an array but is: `, this.config.hasMany );
      return super.hasMany();
    }
    return _.map( this.config.hasMany, hm => {
      return _.isString(hm) ? { type: hm } : hm;
    });
   }

   enum(){
     if( ! this.config.enum ) return super.enum();
     return this.config.enum;
   }

  plural() { return this.config.plural || super.plural() }
	singular() { return this.config.singular || super.singular() }

  collection() { return this.config.collection || super.collection() }
  instance() { return this.config.instance || super.instance() }
  label() { return this.config.label || super.label() }
  path() { return this.config.path || super.path() }
  parent() { return this.config.parent || super.parent() }
  seeds() { return this.config.seeds || super.seeds() }
}
