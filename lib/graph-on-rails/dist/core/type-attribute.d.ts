import { GraphQLInputType, GraphQLType } from 'graphql';
import { SchemaType } from './schema-type';
import { FilterAttributeType } from './filter-attribute-type';
export declare type TypeAttribute = {
    filterType?: string;
    type: string;
};
export declare class Attribute {
    readonly attr: TypeAttribute;
    private entity;
    readonly graphx: import("./graphx").GraphX;
    constructor(attr: TypeAttribute, entity: SchemaType);
    getType(): GraphQLType;
    getFilterInputType(): GraphQLInputType | any;
    getFilterAttributeType(): FilterAttributeType | null;
}
