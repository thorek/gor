import { FilterAttributeType } from '../core/filter-attribute-type';
export declare class EnumFilterAttributeType extends FilterAttributeType {
    private _name;
    name(): string;
    constructor(_name: string);
    createObjectType(): void;
    getFilterExpression(condition: any, field: string): any;
}
