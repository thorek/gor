import { EntityModule } from "../entities/entity-module";


/**
 *
 */
export abstract class Validator extends EntityModule{


  abstract validate( attributes:any, root:any, args:any, context:any ):Promise<string[]>
}


/**
 *
 */
export class NonValidator extends Validator {

  async validate(): Promise<string[]> {
    return [];
  }

}
