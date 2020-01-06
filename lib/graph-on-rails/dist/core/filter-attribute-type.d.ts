import { GraphX } from './graphx';
import { SchemaType } from './schema-type';
/**
 * Base class for all Filter Attributes
 */
export declare abstract class FilterAttributeType extends SchemaType {
    init(graphx: GraphX): void;
    abstract getFilterExpression(args: any, field: string): any;
    protected createObjectType(): void;
    extendTypes(): void;
    protected setAttributes(fields: any): void;
}
