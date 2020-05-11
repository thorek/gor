import { EntityBuilder } from "../builder/entity-builder";
import { SchemaBuilder } from "../builder/schema-builder";

/**
 *
 */
export abstract class Resolver {

  /**
   *
   */
  addEnumFilterAttributeType( name: string ) {}

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
  abstract resolveType( EntityBuilder:EntityBuilder, root:any, args:any ):Promise<any>;

  /**
   *
   */
  abstract resolveTypes( EntityBuilder:EntityBuilder, root:any, args:any ):Promise<any[]>;

  /**
   *
   */
  abstract resolveRefType( refType:EntityBuilder, root:any, args:any ):Promise<any>;

  /**
   *
   */
  abstract resolveRefTypes( EntityBuilder:EntityBuilder, refType:EntityBuilder, root:any, args:any ):Promise<any[]>;

  /**
   *
   */
  abstract saveEntity( EntityBuilder:EntityBuilder, root:any, args:any ):Promise<any>;

  /**
   *
   */
  abstract deleteEntity( EntityBuilder:EntityBuilder, root:any, args:any  ):Promise<boolean>;

  /**
   *
   */
  getScalarFilterTypes():SchemaBuilder[] {
    return [];
  }
}
