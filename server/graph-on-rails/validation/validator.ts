import { Entity } from "../entities/entity";


/**
 *
 */
export abstract class Validator {

  /**
   *
   */
  constructor( public readonly entity:Entity ){}

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
