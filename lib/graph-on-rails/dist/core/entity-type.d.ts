import { GraphX } from './graphx';
import { Resolver } from './resolver';
import { EntityReference, SchemaType } from './schema-type';
/**
 * Base class for all Entities
 */
export declare abstract class EntityType extends SchemaType {
    protected resolver: Resolver;
    belongsTo(): EntityReference[];
    hasMany(): EntityReference[];
    plural(): string;
    singular(): string;
    collection(): string;
    instance(): string;
    label(): string;
    path(): string;
    parent(): string | null;
    constructor(resolver: Resolver);
    init(graphx: GraphX): void;
    protected createObjectType(): void;
    extendTypes(): void;
    addReferences(): void;
    addMutations(): void;
    addQueries(): void;
    protected addBelongsTo(): void;
    private addBelongsToId;
    private addBelongsToReference;
    protected addHasMany(): void;
    private addHasManyReference;
    private checkReference;
    protected createInputType(): void;
    protected setAttributes(fields: any): any;
    protected createFilterType(): void;
    protected addTypeQuery(): void;
    protected addTypesQuery(): void;
    protected addSaveMutation(): void;
    protected addDeleteMutation(): void;
}
