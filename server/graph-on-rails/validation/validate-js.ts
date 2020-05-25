import _ from 'lodash';
import validate from 'validate.js';

import { EntityBuilder } from '../builder/entity-builder';
import { Validator } from './validator';

/**
 *
 */
export class ValidateJs extends Validator {

  private constraints:any = {};

  /**
   *
   */
  constructor( public readonly entityBuilder:EntityBuilder ){
    super( entityBuilder );
    this.buildConstraints();
  }

  /**
   *
   */
  async validate( root:any, args:any ): Promise<string[]> {
    const input = _.get( args, this.entityBuilder.singular() );
    const result = validate( input, this.constraints );
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
    _.forEach( this.entityBuilder.attributes(), (attribute, name:string) => {
      if( _.isObject( attribute.validation ) ) this.constraints[name] = attribute.validation
    });
  }

}
