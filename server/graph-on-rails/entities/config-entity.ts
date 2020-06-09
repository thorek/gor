import _ from 'lodash';

import { FilterType } from '../builder/filter-type';
import { Entity } from './entity';
import { TypeAttribute } from './type-attribute';

/**
 *
 */
export type AttributeConfig = {
  type:string;
  filterType?:string|boolean;
  validation?:any;
  required?:boolean
  unique?:boolean
  description?:string
}

/**
 *
 */
export type EntityConfig  = {
  typeName?:string;

  attributes?:{[name:string]:string|AttributeConfig};
  assocTo?:[string|{type:string}];
  assocToMany?:[string|{type:string}];
  assocFrom?:string[];

	plural?:string
	singular?:string;

  collection?:string;
  instance?:string;
  label?:string;
  path?:string;
  parent?:string;

  seeds:{[name:string]:any}
  permissions:null|{[role:string]:boolean|string|{[action:string]:string|object|(string|object)[]}}
  equality:null|string|{[typeName:string]:string[]}
  description?:string
}

/**
 *
 */
export class ConfigEntity extends Entity {

  /**
   *
   */
  static create( name:string, entityConfig:EntityConfig ):ConfigEntity {
    return new ConfigEntity( name, entityConfig );
  }

  /**
   *
   */
	protected  constructor(
      protected readonly _name:string,
      public readonly entityConfig:EntityConfig ){
   super();
  }

  protected getName() { return this._name }
  protected getTypeName() { return this.entityConfig.typeName || super.getTypeName() }
  protected getAttributes() {
    if( ! this.entityConfig.attributes ) return super.getAttributes();
    const attributes = _.mapValues( this.entityConfig.attributes, (attrConfig, name) => this.buildAttribute( name, attrConfig ) );
    return _.pickBy( attributes, _.identity ) as {[name:string]:TypeAttribute};
  }
	protected getAssocTo() {
    if( ! this.entityConfig.assocTo ) return super.getAssocTo();
    return _.map( this.entityConfig.assocTo, bt => {
      return _.isString(bt) ? { type: bt } : bt;
    });
  }
	protected getAssocToMany() {
    if( ! this.entityConfig.assocToMany ) return super.getAssocToMany();
    return _.map( this.entityConfig.assocToMany, bt => {
      return _.isString(bt) ? { type: bt } : bt;
    });
  }
  protected getAssocFrom(){
    if( ! this.entityConfig.assocFrom ) return super.getAssocFrom();
    if( ! _.isArray( this.entityConfig.assocFrom ) ){
      console.warn(`'${this.name}' assocFrom must be an array but is: `, this.entityConfig.assocFrom );
      return super.getAssocFrom();
    }
    return _.map( this.entityConfig.assocFrom, hm => {
      return _.isString(hm) ? { type: hm } : hm;
    });
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
    return _.isString( sr ) ? _.set( {}, sr, _.map( this.assocTo, bt => bt.type ) ) : sr;
  }
  protected getDescription():string|undefined { return this.entityConfig.description || super.getDescription() }

  /**
   *
   */
  private buildAttribute( name:string, attrConfig:AttributeConfig|string ):TypeAttribute {
    if( _.isString( attrConfig ) ) attrConfig = { type: attrConfig };
    attrConfig.type = _.capitalize( attrConfig.type );
    if( _.endsWith( attrConfig.type, '!' ) ){
      attrConfig.type = attrConfig.type.slice(0, -1);
      attrConfig.required = true;
    }
    if( attrConfig.filterType === true ) attrConfig.filterType === undefined;

    return {
      graphqlType: attrConfig.type,
      filterType: attrConfig.filterType as string|false|undefined,
      validation: attrConfig.validation,
      unique: attrConfig.unique,
      required: attrConfig.required,
      description: attrConfig.description
    }
  }

}
