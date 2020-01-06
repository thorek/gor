import { GraphQLSchema } from 'graphql';
import { EntityType } from './entity-type';
import { FilterAttributeType } from './filter-attribute-type';
export declare class GraphX {
    readonly entities: {
        [name: string]: EntityType;
    };
    readonly filterAttributes: {
        [name: string]: FilterAttributeType;
    };
    rawTypes: any;
    private fnFromArray;
    constructor();
    /**
     *
     * @param name
     */
    addEnumFilterAttributeType(name: string): void;
    private createType;
    type(name: string, obj?: any): any;
    /**
     *
     */
    generate: () => GraphQLSchema;
    /**
     *
     */
    private generateMetaData;
    /**
     *
     */
    private generateTypes;
}
