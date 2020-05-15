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
    const errors:string[] = [];
    _.forEach( result, (violations, key) => {
      violations = _.isArray( violations ) ? violations : [violations];
      _.forEach( violations, violation => {
        const msg = _.get( violation, '__class__' ) === 'Violation' && (! _.isObject( _.get( violation, 'value')) ) ?
          violation.__toString() : `${_.get(violation, ['assert', '__class__'])} assert failed`;
        errors.push( `${key} : ${ msg }` );
      });
    });
    return errors;
  }

  /**
   *
   */
  private buildConstraint() {
    this.constraint = {};
    _.forEach( this.entityBuilder.attributes(), (attribute, name:string) => {
      this.constraint[name] = [];
      _.forEach( attribute.validation, (options:any, method:string ) => {
        if( options === false ) return;
        this.constraint[name].push( is[method](options) );
      })
    });
    if(this.entityBuilder.name() == 'Client' ) console.log( this.constraint );
  }

}
