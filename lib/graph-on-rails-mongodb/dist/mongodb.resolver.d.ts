import { Collection, Db, FilterQuery } from 'mongodb';
import { EntityType, Resolver } from 'graph-on-rails';
/**
 *
 */
export declare class MongoDbResolver extends Resolver {
    protected db: Db;
    /**
     *
     */
    constructor(db: Db);
    /**
     *
     */
    static create(config: {
        url: string;
        dbName: string;
    }): Promise<Resolver>;
    /**
     *
     */
    protected static getDb(config: any): Promise<Db>;
    /**
     *
     */
    protected getCollection(entityType: EntityType): Collection;
    /**
     *
     */
    resolveType(entityType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    resolveRefType(refType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    resolveRefTypes(entityType: EntityType, refType: EntityType, root: any, args: any): Promise<any[]>;
    /**
     *
     */
    resolveTypes(entityType: EntityType, root: any, args: any): Promise<any[]>;
    /**
     *
     */
    saveEntity(entityType: EntityType, root: any, args: any): Promise<any>;
    /**
     *
     */
    protected getFilter(entityType: EntityType, root: any, args: any): FilterQuery<any>;
    protected getOutEntity(entity: any): any;
    protected updateEntity(entityType: EntityType, attrs: any): Promise<any>;
    protected createEntity(entityType: EntityType, attrs: any): Promise<any>;
    /**
     *
     */
    deleteEntity(entityType: EntityType, root: any, args: any): Promise<boolean>;
}
