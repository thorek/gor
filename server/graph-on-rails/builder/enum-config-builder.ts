import _ from 'lodash';
import { EnumBuilder } from './enum-builder';

/**
 *
 */
export type EnumConfig  = {
  enum:{[name:string]:string}
}


/**
 *
 */
export class EnumConfigBuilder extends EnumBuilder {

  name(): string { return this._name }
  enum(){
    if( ! _.isArray( this.config) ) return this.config;
    const e = {};
    _.forEach( this.config, item => {
      _.set( e, _.toUpper( item ), _.toLower( item ) );
    })
    return e;
 }


  /**
   *
   */
  static create( name:string, enumConfig:EnumConfig ):EnumConfigBuilder {
    return new EnumConfigBuilder( name, enumConfig );
  }

	//
	//
	constructor(
      protected readonly _name:string,
      protected readonly config:EnumConfig )
  { super() }
}
