import { EntityType, Resolver } from 'graph-on-rails';
import { FilterQuery } from 'mongodb';
import { MongoDbResolver } from './mongodb.resolver';
/**
 *
 */
export declare class VersionedMongoDbResolver extends MongoDbResolver {
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
    extendType(entityType: EntityType): void;
    /**
     *
     */
    resolveRefTypes(entityType: EntityType, refType: EntityType, root: any, args: any): Promise<any[]>;
    /**
     *
     */
    protected getFilter(entityType: EntityType, root: any, args: any): FilterQuery<any>;
    protected getOutEntity(entity: any): any;
    protected updateEntity(entityType: EntityType, attrs: any): Promise<any>;
    protected createEntity(entityType: EntityType, attrs: any): Promise<any>;
}
