import { GorContext } from '../core/gor-context';
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
