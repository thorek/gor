import { EntityModule } from "../entities/entity-module";
import { ValidationViolation } from "../entities/entity-validator";


/**
 *
 */
export abstract class Validator extends EntityModule{


  abstract validate( attributes:any, root:any, args:any, context:any ):Promise<ValidationViolation[]>
}


/**
 *
 */
export class NonValidator extends Validator {

  async validate(): Promise<ValidationViolation[]> {
    return [];
  }

}
