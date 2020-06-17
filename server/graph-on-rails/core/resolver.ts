import { FilterType } from '../builder/filter-type';
import { Entity } from '../entities/entity';
import { ResolverContext } from './resolver-context';
import { CrudAction } from '../entities/entity-permissions';

/**
 *
 */
export abstract class Resolver {

  abstract buildExpression( entity:Entity, filter:any ):any;

  abstract findByExpression( entity:Entity, filter:any ):Promise<any[]>;

  abstract addPermittedIds( expression:any, ids:any[]|boolean ):Promise<any>;

  /**
   *
   */
  abstract createType( entity:Entity, attrs: any ):Promise<any>;

  /**
   *
   */
  abstract updateType( entity:Entity, attrs: any ):Promise<any>;

  /**
   *
   */
  abstract deleteType( entity:Entity, id:any  ):Promise<boolean>;

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
