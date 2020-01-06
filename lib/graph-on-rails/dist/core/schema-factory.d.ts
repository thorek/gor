import { SchemaType } from './schema-type';
import { GraphQLSchema } from 'graphql';
export declare class SchemaFactory {
    private types;
    constructor(types: SchemaType[]);
    createSchema(): GraphQLSchema;
}
