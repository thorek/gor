import _ from 'lodash';

import { EntityBuilder } from '../builder/entity-builder';
import { Validator, ValidatorFactory } from './validator';
import validate from 'validate.js';


/**
 *
 */
export class ValidateJsFactory extends ValidatorFactory {

  createValidator( entityBuilder:EntityBuilder ):Validator {
    return new ValidateJs( entityBuilder );
  }

}

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
    if(this.entityBuilder.name() == 'Client' ) console.log( this.constraints );
  }

}
