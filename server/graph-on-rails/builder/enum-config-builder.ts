import { Resolver } from '../core/resolver';
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
  enum(){ return this.config }


  /**
   *
   */
  static create( name:string, resolver:Resolver, config:EnumConfig ):EnumConfigBuilder {
    return new EnumConfigBuilder( name, resolver, config );
  }

	//
	//
	constructor(
      protected readonly _name:string,
      protected readonly resolver:Resolver,
      protected readonly config:EnumConfig )
  {
    super( resolver );
    console.log( _name, config );
  }
}
