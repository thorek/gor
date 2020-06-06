import _ from 'lodash';
import validate from 'validate.js';

import { Entity } from '../entities/entity';
import { Validator } from './validator';

/**
 *
 */
export class ValidateJs extends Validator {

  private constraints:any = {};

  /**
   *
   */
  constructor( protected readonly entity:Entity ){
    super( entity );
    this.buildConstraints();
  }

  /**
   *
   */
  async validate( attributes:any ): Promise<string[]> {
    const result = validate( attributes, this.constraints );
    return result === true ? [] : this.formatErrors( result );
  }

  /**
   *
   */
  private formatErrors( result:any ):string[] {
    const errors:string[] = [];
    _.forEach( result, (messages:string[], attribute) => {
      _.forEach( messages, message => errors.push( `${attribute} : ${message}` ));
    });
    return errors;
  }

  /**
   *
   */
  private buildConstraints() {
    this.constraints = {};
    _.forEach( this.entity.attributes, (attribute, name:string) => {
      if( _.isObject( attribute.validation ) ) this.constraints[name] = attribute.validation
    });
  }

}
