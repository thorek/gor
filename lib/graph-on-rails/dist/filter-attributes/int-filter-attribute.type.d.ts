import { FilterAttributeType } from '../core/filter-attribute-type';
/**
 *
 */
export declare class IntFilterAttributeType extends FilterAttributeType {
    name(): string;
    attributes(): {
        eq: {
            type: string;
        };
        ne: {
            type: string;
        };
        le: {
            type: string;
        };
        lt: {
            type: string;
        };
        ge: {
            type: string;
        };
        gt: {
            type: string;
        };
        isIn: {
            type: string;
        };
        notIn: {
            type: string;
        };
        between: {
            type: string;
        };
    };
    getFilterExpression(condition: any, field: string): any;
}
