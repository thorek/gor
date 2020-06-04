import { Entity } from "../entities/entity";
import { Resolver } from "./resolver";

/**
 *
 */
export class NoResolver extends Resolver {

  resolveAssocToManyTypes( entity: Entity, refType: Entity, root: any, args: any, context: any ): Promise<any[]> {
    throw new Error( "Method not implemented." );
  }

  /**
   *
   */
  async resolveType( entity:Entity, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to resolve type '${entity.name}'`);
    return {};
  }

  /**
   *
   */
  async resolveTypes( entity:Entity, root:any, args:any ):Promise<any[]>{
    console.warn(`no resolver specified to resolve types for '${entity.name}'`);
    return [{}];
  }

  /**
   *
   */
  async resolveRefType( entity:Entity, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to resolve reference type '${entity.name}'`);
    return {};
  }

  /**
   *
   */
  async resolveRefTypes( entity:Entity, refType:Entity, root:any, args:any ):Promise<any[]> {
    console.warn(`no resolver specified to resolve reference types for '${entity.name}'`);
    return [{}];
  }

  /**
   *
   */
  async saveEntity( entity:Entity, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to save type '${entity.name}'`);
    return {};
  }

  /**
   *
   */
  async deleteEntity( entity:Entity, root:any, args:any  ):Promise<boolean> {
    console.warn(`no resolver specified to delete type '${entity.name}'`);
    return false;
  }

  /**
   *
   */
  async dropCollection( entity: Entity ): Promise<boolean> {
    console.warn(`no resolver specified to drop collection '${entity.name}'`);
    return false;
  }

  /**
   *
   */
  async query( entity: Entity, expression: any ): Promise<any> {
    console.warn(`no resolver specified to query '${entity.name}'`);
    return false;
  }

  /**
   *
   */
  async getPermittedIds( entity: Entity, expression: object, context: any ): Promise<number[]> {
    console.warn(`no resolver specified to get permissions '${entity.name}'`);
    return [];
  }

  /**
   *
   */
  async getPermittedIdsForForeignKeys( entity: Entity, assocTo: string, foreignKeys: number[] ): Promise<number[]> {
    console.warn(`no resolver specified to get permissions '${entity.name}'`);
    return [];
  }

}
