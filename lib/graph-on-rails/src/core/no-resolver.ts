import { EntityBuilder } from "../builder/entity-builder";

/**
 *
 */
export class NoResolver {


  /**
   *
   */
  init( EntityBuilder:EntityBuilder ):void { }

  /**
   *
   */
  extendType( EntityBuilder:EntityBuilder ):void { }

  /**
   *
   */
  async resolveType( EntityBuilder:EntityBuilder, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to resolve type '${EntityBuilder.name}'`);
    return {};
  }

  /**
   *
   */
  async resolveTypes( EntityBuilder:EntityBuilder, root:any, args:any ):Promise<any[]>{
    console.warn(`no resolver specified to resolve types for '${EntityBuilder.name}'`);
    return [{}];
  }

  /**
   *
   */
  async resolveRefType( EntityBuilder:EntityBuilder, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to resolve reference type '${EntityBuilder.name}'`);
    return {};
  }

  /**
   *
   */
  async resolveRefTypes( EntityBuilder:EntityBuilder, refType:EntityBuilder, root:any, args:any ):Promise<any[]> {
    console.warn(`no resolver specified to resolve reference types for '${EntityBuilder.name}'`);
    return [{}];
  }

  /**
   *
   */
  async saveEntity( EntityBuilder:EntityBuilder, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to save type '${EntityBuilder.name}'`);
    return {};
  }

  /**
   *
   */
  async deleteEntity( EntityBuilder:EntityBuilder, root:any, args:any  ):Promise<boolean> {
    console.warn(`no resolver specified to delete type '${EntityBuilder.name}'`);
    return false;
  }
}
