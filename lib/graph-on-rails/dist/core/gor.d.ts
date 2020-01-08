import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import { EntityType } from './entity-type';
import { Resolver } from './resolver';
/**
 *
 */
export declare class Gor {
    private _schema?;
    private configs;
    private customEntities;
    /**
     *
     */
    addConfigs(folder: string, resolver: Resolver): void;
    /**
     *
     */
    addCustomEntities(...types: EntityType[]): void;
    /**
     *
     */
    schema(): Promise<GraphQLSchema>;
    /**
     *
     */
    server(config?: ApolloServerExpressConfig): Promise<ApolloServer>;
    /**
     *
     */
    private getConfigEntities;
    /**
     *
     */
    private getDefaultFilterTypes;
    /**
     *
     */
    private getConfigFiles;
    /**
     *
     */
    private createConfigurationType;
}
