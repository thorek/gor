import { EntityModule } from "../entities/entity-module";
import { ValidationViolation } from "../entities/entity-validator";
import { ResolverContext } from "../core/resolver-context";


/**
 *
 */
export abstract class Validator extends EntityModule{


  abstract validate( attributes:any ):Promise<ValidationViolation[]>
}


/**
 *
 */
export class NonValidator extends Validator {

  async validate(): Promise<ValidationViolation[]> {
    return [];
  }

}
