import { FilterAttributeType } from '../core/filter-attribute-type';
/**
 *
 */
export declare class StringFilterAttributeType extends FilterAttributeType {
    name(): string;
    attributes(): {
        ne: {
            type: string;
        };
        eq: {
            type: string;
        };
        in: {
            type: string;
        };
        notIn: {
            type: string;
        };
        contains: {
            type: string;
        };
        notContains: {
            type: string;
        };
        beginsWith: {
            type: string;
        };
    };
    getFilterExpression(condition: any, field: string): any;
}
