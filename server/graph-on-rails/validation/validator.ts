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
export class ValidatorFactory {

  createValidator( entityBuilder:EntityBuilder ):Validator {
    return new NonValidator( entityBuilder );
  }
}

/**
 *
 */
export class NonValidator extends Validator {

  async validate( root:any, args:any ): Promise<string[]> {
    return [];
  }

}
