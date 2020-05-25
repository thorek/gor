import { EntityBuilder } from "../builder/entity-builder";


/**
 *
 */
export abstract class Validator {

  /**
   *
   */
  constructor( public readonly entityBuilder:EntityBuilder ){}

  abstract validate( root:any, args:any ):Promise<string[]>
}


/**
 *
 */
export class NonValidator extends Validator {

  async validate( root:any, args:any ): Promise<string[]> {
    return [];
  }

}
