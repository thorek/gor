import _ from 'lodash';

import { MongoDbResolver } from '../../graph-on-rails-mongodb/mongodb.resolver';
import { FilterType } from '../builder/filter-type';
import { SchemaBuilder } from '../builder/schema-builder';
import { Entity } from '../entities/entity';
import { EntityPermissions } from '../entities/entity-permissions';
import { EntitySeeder } from '../entities/entity-seeder';
import { ValidateJs } from '../validation/validate-js';
import { Validator } from '../validation/validator';
import { GraphX } from './graphx';
import { Resolver } from './resolver';
import { ResolverContext } from './resolver-context';
import { EntityConfig } from '../entities/config-entity';
import { EnumConfig } from '../builder/enum-config-builder';
import { EntityResolveHandler } from '../entities/entity-resolve-handler';
import { GraphQLInputType, GraphQLType } from 'graphql';

export type GorConfig = {
  name?:string
  resolver?:Resolver
  validator?:(entity:Entity) => Validator
  entityResolveHandler?:(entity:Entity) => EntityResolveHandler
  entityPermissions?:(entity:Entity) => EntityPermissions
  entitySeeder?:(entity:Entity) => EntitySeeder
  contextUser?:string
  contextRoles?:string
  extendSchema?:(context:Context) => void
  virtualResolver?:{[entity:string]:{[attribute:string]: ( item:any, rctx?:ResolverContext ) => any|Promise<any> }}
  configFolder?:string[]
  schemaBuilder?:SchemaBuilder[]
  entities?:Entity[]
  domainConfiguration?:{entity?: {[name:string]:EntityConfig}, enum?:{[name:string]:EnumConfig}}
}

export class Context {

  readonly graphx = new GraphX();
  readonly entities:{[name:string]:Entity} = {};
  readonly filterTypes:{[name:string]:FilterType} = {};
  get extendSchema() { return this.config.extendSchema }
  get virtualResolver() { return this.config.virtualResolver }

  private constructor( public readonly config:GorConfig ){}

  /**
   *
   */
  static async create( name:string, config?:GorConfig):Promise<Context> {
    if( ! config ) config = {};
    if( ! config.resolver ) config.resolver = await this.getDefaultResolver( name );
    _.defaults( config, {
      validator: (entity:Entity) => new ValidateJs( entity ),
      entityResolveHandler: (entity:Entity) => new EntityResolveHandler( entity ),
      entityPermissions: (entity:Entity) => new EntityPermissions( entity ),
      entitySeeder: (entity:Entity) => new EntitySeeder( entity ),
      contextUser: 'user',
      contextRoles: 'roles'
    })
    return new Context(config);
  }

  private static getDefaultResolver( dbName:string ):Promise<Resolver> {
    return MongoDbResolver.create( { url: 'mongodb://localhost:27017', dbName } );
  }

  get resolver() {
    if( ! this.config.resolver ) throw new Error("Context - you must provide a resolver" );
    return this.config.resolver;
  }

  validator( entity:Entity ) {
    if( ! this.config.validator ) throw new Error("Context - you must provide a validator factory method" );
    return this.config.validator(entity);
  }

  entityResolveHandler( entity:Entity ) {
    if( ! this.config.entityResolveHandler ) throw new Error("Context - you must provide an entityResolveHandler factory method" );
    return this.config.entityResolveHandler(entity);
  }

  entityPermissions( entity:Entity ) {
    if( ! this.config.entityPermissions ) throw new Error("Context - you must provide an entityPermissions factory method" );
    return this.config.entityPermissions(entity);
  }

  entitySeeder( entity:Entity ) {
    if( ! this.config.entitySeeder ) throw new Error("Context - you must provide an entitySeeder factory method" );
    return this.config.entitySeeder(entity);
  }

  filterType( filterType:string|FilterType|false|undefined, fieldType:string|GraphQLType ):FilterType|undefined {
    if( filterType === false ) return undefined;
    if( ! filterType ) {
      if( ! _.isString( fieldType ) ) fieldType = _.get( fieldType, 'name' );
      return this.filterTypes[ SchemaBuilder.getFilterName(fieldType as string) ];
    } else if( _.isString( filterType ) ) {
      return this.filterTypes[ filterType ];
    } else return filterType;
  }

  readonly contextUser = this.config.contextUser;
  readonly contextRoles = this.config.contextRoles;


}
