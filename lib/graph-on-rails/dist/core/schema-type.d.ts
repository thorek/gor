import { GraphX } from './graphx';
import { Attribute, TypeAttribute } from './type-attribute';
export declare type EntityReference = {
    type: string;
};
/**
 * Base class for any custom type that can occur in a GraphQL Schema
 */
export declare abstract class SchemaType {
    abstract name(): string;
    typeName(): string;
    attributes(): {
        [name: string]: TypeAttribute;
    };
    enums(): {
        [name: string]: {
            [key: string]: string;
        };
    };
    graphx: GraphX;
    protected _attributes?: {
        [name: string]: Attribute;
    };
    init(graphx: GraphX): void;
    createTypes(): void;
    abstract extendTypes(): void;
    protected abstract createObjectType(): void;
    protected createEnums(): void;
    protected createEnumFilter(name: string): void;
    protected getAttributes(): {
        [name: string]: Attribute;
    };
    getAttribute(name: string): Attribute;
}
