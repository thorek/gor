import { SchemaBuilder } from '../builder/schema-builder';
import { Entity } from '../entities/entity';
import { GorContext } from './gor-context';

/**
 *
 */
export abstract class Resolver {

  /**
   *
   */
  abstract resolveType( entity:Entity, root:any, args:any, context:any ):Promise<any>;

  /**
   *
   */
  abstract resolveTypes( entity:Entity, root:any, args:any, context:any ):Promise<any[]>;

  /**
   *
   */
  abstract resolveAssocToType( refType:Entity, root:any, args:any, context:any ):Promise<any>;

  /**
   *
   */
  abstract resolveAssocFromTypes( entity:Entity, refType:Entity, root:any, args:any, context:any ):Promise<any[]>;

  /**
   *
   */
  abstract resolveAssocToManyTypes( entity:Entity, refType:Entity, root:any, args:any, context:any ):Promise<any[]>;

  /**
   *
   */
  abstract saveEntity( entity:Entity, root:any, args:any, context:any ):Promise<any>;

  /**
   *
   */
  abstract deleteEntity( entity:Entity, root:any, args:any, context:any  ):Promise<boolean>;

  /**
   *
   */
  abstract dropCollection( entity:Entity ):Promise<boolean>;

  /**
   *
   */
  getScalarFilterTypes():SchemaBuilder[] { return [] }

  /**
   *
   */
  addEnumFilterAttributeType( name: string, context:GorContext ) {}

  /**
   *
   */
  abstract query( entity:Entity, expression:any ):Promise<any>;

  /**
   *
   */
  abstract getPermittedIds( entity:Entity, expression:object, context:any ):Promise<number[]>;

  /**
   *
   */
  abstract getPermittedIdsForForeignKeys( entity:Entity, assocTo:string, foreignKeys:number[] ):Promise<number[]>;

  /**
   *
   */
  abstract findByAttribute( entity:Entity, attribute:string, value:any ):Promise<any[]>;
}
