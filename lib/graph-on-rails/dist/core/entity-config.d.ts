export declare type AttributeConfig = {
    type: string;
};
export declare type EntityConfig = {
    name: string;
    typeName?: string;
    attributes?: {
        [name: string]: string | AttributeConfig;
    };
    belongsTo?: [string | {
        type: string;
    }];
    hasMany?: string[];
    plural?: string;
    singular?: string;
    collection?: string;
    instance?: string;
    label?: string;
    path?: string;
    parent?: string;
    enums: {
        [name: string]: {
            [key: string]: string;
        };
    };
};
