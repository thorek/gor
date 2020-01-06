import { EntityType } from './entity-type';
export declare abstract class Resolver {
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
    abstract resolveType(entityType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    abstract resolveTypes(entityType: EntityType, root: any, args: any): Promise<any[]>;
    /**
     *
     */
    abstract resolveRefType(refType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    abstract resolveRefTypes(entityType: EntityType, refType: EntityType, root: any, args: any): Promise<any[]>;
    /**
     *
     */
    abstract saveEntity(entityType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    abstract deleteEntity(entityType: EntityType, root: any, args: any): Promise<boolean>;
}
