import { EntityType } from '../core/entity-type';
/**
 *
 */
export declare class NoResolver {
    /**
     *
     */
    init(entityType: EntityType): void;
    /**
     *
     */
    extendType(entityType: EntityType): void;
    /**
     *
     */
    resolveType(entityType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    resolveTypes(entityType: EntityType, root: any, args: any): Promise<any[]>;
    /**
     *
     */
    resolveRefType(entityType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    resolveRefTypes(entityType: EntityType, refType: EntityType, root: any, args: any): Promise<any[]>;
    /**
     *
     */
    saveEntity(entityType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    deleteEntity(entityType: EntityType, root: any, args: any): Promise<boolean>;
}
