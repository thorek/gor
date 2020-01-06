import { EntityType } from '../core/entity-type';

/**
 *
 */
export class NoResolver {


  /**
   *
   */
  init( entityType:EntityType ):void { }

  /**
   *
   */
  extendType( entityType:EntityType ):void { }

  /**
   *
   */
  async resolveType( entityType:EntityType, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to resolve type '${entityType.name}'`);
    return {};
  }

  /**
   *
   */
  async resolveTypes( entityType:EntityType, root:any, args:any ):Promise<any[]>{
    console.warn(`no resolver specified to resolve types for '${entityType.name}'`);
    return [{}];
  }

  /**
   *
   */
  async resolveRefType( entityType:EntityType, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to resolve reference type '${entityType.name}'`);
    return {};
  }

  /**
   *
   */
  async resolveRefTypes( entityType:EntityType, refType:EntityType, root:any, args:any ):Promise<any[]> {
    console.warn(`no resolver specified to resolve reference types for '${entityType.name}'`);
    return [{}];
  }

  /**
   *
   */
  async saveEntity( entityType:EntityType, root:any, args:any ):Promise<any> {
    console.warn(`no resolver specified to save type '${entityType.name}'`);
    return {};
  }

  /**
   *
   */
  async deleteEntity( entityType:EntityType, root:any, args:any  ):Promise<boolean> {
    console.warn(`no resolver specified to delete type '${entityType.name}'`);
    return false;
  }
}
