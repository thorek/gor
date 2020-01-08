import _ from 'lodash';
import { EntityConfig } from './entity-config';
import { EntityType } from './entity-type';
import { Resolver } from './resolver';

/**
 *
 */
export class ConfigurationType extends EntityType {

  /**
   *
   */
  static create( resolver:Resolver, config:EntityConfig ):ConfigurationType | null {
    if( ! _.has( config, 'name' ) ) throw new Error('no name property' );
    return new ConfigurationType( resolver, config );
  }

  /**
   *
   */
	constructor(
      protected readonly resolver:Resolver,
      protected readonly config:EntityConfig ){
    super( resolver);
  }

  name() { return this.config.name }
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
    return _.map( this.config.hasMany, hm => {
      return _.isString(hm) ? { type: hm } : hm;
    });
   }

   enums(){
     if( ! this.config.enums ) return super.enums();
     return this.config.enums;
   }

  plural() { return this.config.plural || super.plural() }
	singular() { return this.config.singular || super.singular() }

  collection() { return this.config.collection || super.collection() }
  instance() { return this.config.instance || super.instance() }
  label() { return this.config.label || super.label() }
  path() { return this.config.path || super.path() }
  parent() { return this.config.parent || super.parent() }

}
