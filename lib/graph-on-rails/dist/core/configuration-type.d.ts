import { EntityConfig } from './entity-config';
import { EntityType } from './entity-type';
import { Resolver } from './resolver';
/**
 *
 */
export declare class ConfigurationType extends EntityType {
    protected readonly resolver: Resolver;
    protected readonly config: EntityConfig;
    /**
     *
     */
    static create(resolver: Resolver, config: EntityConfig): ConfigurationType | null;
    /**
     *
     */
    constructor(resolver: Resolver, config: EntityConfig);
    name(): string;
    typeName(): string;
    attributes(): {
        [x: string]: import("./entity-config").AttributeConfig;
    };
    belongsTo(): import("./schema-type").EntityReference[];
    hasMany(): import("./schema-type").EntityReference[];
    plural(): string;
    singular(): string;
    collection(): string;
    instance(): string;
    label(): string;
    path(): string;
    parent(): string | null;
}
