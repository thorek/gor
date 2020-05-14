import _ from 'lodash';

import { EntityBuilder } from '../builder/entity-builder';
import { Validator, ValidatorFactory } from './validator';
const is = require( 'validator.js' ).Assert;
const validator = require( 'validator.js' ).validator();


/**
 *
 */
export class ValidatorJsFactory extends ValidatorFactory {

  createValidator( entityBuilder:EntityBuilder ):Validator {
    return new ValidatorJs( entityBuilder );
  }

}

/**
 *
 */
export class ValidatorJs extends Validator {

  private constraint:any = {};
  /**
   *
   */
  constructor( public readonly entityBuilder:EntityBuilder ){
    super( entityBuilder );
    this.buildConstraint();
  }

  /**
   *
   */
  async validate( root:any, args:any ): Promise<string[]> {
    const input = _.get( args, this.entityBuilder.singular() );
    const result = validator.validate( input, this.constraint );
    return result === true ? [] : this.formatErrors( result );
  }

  /**
   *
   */
  private formatErrors( result:any ):string[] {
    return _.map( result, (values, key) => `${key}: ${_.map( values, value => {
      return value.violation ? JSON.stringify(value.violation) : "not allowed";
    } ).join(', ')}`)
  }

  /**
   *
   */
  private buildConstraint() {
    this.constraint = {};
    _.forEach( this.entityBuilder.attributes(), (attribute, name:string) => {
      this.constraint[name] = [];
      _.forEach( attribute.validation, (options:any, method:string ) => {
        this.constraint[name].push( is[method]( options ) );
      })
    });
  }

}
