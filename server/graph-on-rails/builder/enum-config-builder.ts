import { GorConfig } from '../core/gor';
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
  static create( name:string, gorConfig:GorConfig, enumConfig:EnumConfig ):EnumConfigBuilder {
    return new EnumConfigBuilder( name, gorConfig, enumConfig );
  }

	//
	//
	constructor(
      protected readonly _name:string,
      protected readonly gorConfig:GorConfig,
      protected readonly config:EnumConfig )
  {
    super( gorConfig );
  }
}
