import { EntityModule } from "../entities/entity-module";


/**
 *
 */
export abstract class Validator extends EntityModule{


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
