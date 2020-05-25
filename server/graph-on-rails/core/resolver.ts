import { EntityBuilder } from "../builder/entity-builder";
import { SchemaBuilder } from "../builder/schema-builder";
import { GraphX } from "./graphx";

/**
 *
 */
export abstract class Resolver {

  /**
   *
   */
  init( EntityBuilder:SchemaBuilder ):void { }

  /**
   *
   */
  extendType( EntityBuilder:EntityBuilder ):void { }

  /**
   *
   */
  abstract resolveType( EntityBuilder:EntityBuilder, root:any, args:any, context:any ):Promise<any>;

  /**
   *
   */
  abstract resolveTypes( EntityBuilder:EntityBuilder, root:any, args:any, context:any ):Promise<any[]>;

  /**
   *
   */
  abstract resolveRefType( refType:EntityBuilder, root:any, args:any, context:any ):Promise<any>;

  /**
   *
   */
  abstract resolveRefTypes( EntityBuilder:EntityBuilder, refType:EntityBuilder, root:any, args:any, context:any ):Promise<any[]>;

  /**
   *
   */
  abstract saveEntity( EntityBuilder:EntityBuilder, root:any, args:any, context:any ):Promise<any>;

  /**
   *
   */
  abstract deleteEntity( EntityBuilder:EntityBuilder, root:any, args:any, context:any  ):Promise<boolean>;

  /**
   *
   */
  abstract dropCollection( EntityBuilder:EntityBuilder ):Promise<boolean>;

  /**
   *
   */
  getScalarFilterTypes():SchemaBuilder[] { return [] }

  /**
   *
   */
  addEnumFilterAttributeType( name: string, graphx:GraphX ) {}

  /**
   *
   */
  abstract query( entityType:EntityBuilder, expression:any ):Promise<any>;

  /**
   *
   */
  abstract getPermittedIds( entityType:EntityBuilder, expression:object, context:any ):Promise<any>;

}
