import { FilterType } from '../builder/filter-type';
import { Entity } from '../entities/entity';
import { ResolverContext } from './resolver-context';

/**
 *
 */
export abstract class Resolver {


  /**
   *
   */
  abstract resolveTypes( entity:Entity, resolverCtx:ResolverContext ):Promise<any[]>;

  /**
   *
   */
  abstract createType( entity:Entity, attrs: any, resolverCtx:ResolverContext ):Promise<any>;

  /**
   *
   */
  abstract updateType( entity:Entity, attrs: any, resolverCtx:ResolverContext ):Promise<any>;

  /**
   *
   */
  abstract deleteType( entity:Entity, resolverCtx:ResolverContext  ):Promise<boolean>;

  /**
   *
   */
  abstract truncate( entity:Entity ):Promise<boolean>;

  /**
   *
   */
  abstract getScalarFilterTypes():FilterType[];

  /**
   *
   */
  abstract getEnumFilterType( name: string ):FilterType;

  /**
   *
   */
  abstract getPermittedIds( entity:Entity, expression:object, resolverCtx:ResolverContext ):Promise<number[]>;

  /**
   *
   */
  abstract getPermittedIdsForForeignKeys( entity:Entity, assocTo:string, foreignKeys:number[] ):Promise<number[]>;

  /**
   *
   */
  abstract findByAttribute( entity:Entity, attrValue:{[name:string]:any} ):Promise<any[]>;

  /**
   *
   */
  abstract findById( entity:Entity, id:any ):Promise<any>

  /**
   *
   */
  abstract findByIds( entity:Entity, id:any ):Promise<any>

}
