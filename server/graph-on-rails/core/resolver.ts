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
  abstract resolveType( entity:Entity, resolverCtx:ResolverContext ):Promise<any>;

  /**
   *
   */
  abstract resolveTypes( entity:Entity, resolverCtx:ResolverContext ):Promise<any[]>;

  /**
   *
   */
  abstract resolveAssocToType( refType:Entity, resolverCtx:ResolverContext ):Promise<any>;

  /**
   *
   */
  abstract resolveAssocFromTypes( entity:Entity, refType:Entity, resolverCtx:ResolverContext ):Promise<any[]>;

  /**
   *
   */
  abstract resolveAssocToManyTypes( entity:Entity, refType:Entity, resolverCtx:ResolverContext ):Promise<any[]>;

  /**
   *
   */
  abstract saveEntity( entity:Entity, resolverCtx:ResolverContext ):Promise<any>;

  /**
   *
   */
  abstract deleteEntity( entity:Entity, resolverCtx:ResolverContext  ):Promise<boolean>;

  /**
   *
   */
  abstract dropCollection( entity:Entity ):Promise<boolean>;

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
  abstract findByExpression( entity:Entity, filter:any ):Promise<any[]>
}
