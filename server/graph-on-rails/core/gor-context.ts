import _ from 'lodash';

import { MongoDbResolver } from '../../graph-on-rails-mongodb/mongodb.resolver';
import { Entity } from '../entities/entity';
import { EntityPermissions } from '../entities/entity-permissions';
import { EntitySeeder } from '../entities/entity-seeder';
import { ValidateJs } from '../validation/validate-js';
import { Validator } from '../validation/validator';
import { Resolver } from './resolver';

export type GorConfig = {
  name?:string
  resolver?: (entity?:Entity) => Resolver
  validator?:(entity:Entity) => Validator
  entityPermissions?:(entity:Entity) => EntityPermissions
  entitySeeder?:(entity:Entity) => EntitySeeder
  contextUser?:string
  contextRoles?:string
}

export class GorContext {

  private constructor( private config:GorConfig ){}

  /**
   *
   */
  static async create( config:GorConfig|string|undefined = undefined):Promise<GorContext> {
    if( ! config ) config = {};
    if( _.isString( config ) ) config = { name: config };
    if( ! config.name ) config.name = "default";
    if( ! config.resolver ) {
      const resolver = await MongoDbResolver.create( { url: 'mongodb://localhost:27017', dbName: config.name } );
      config.resolver = (entity?:Entity) => resolver;
    }
    _.defaults( config, {
      validator: (entity:Entity) => new ValidateJs( entity ),
      entityPermissions: (entity:Entity) => new EntityPermissions( entity ),
      entitySeeder: (entity:Entity) => new EntitySeeder( entity ),
      contextUser: 'user',
      contextRoles: 'roles'
    })
    return new GorContext(config);
  }

  resolver( entity?:Entity ) {
    if( ! this.config.resolver ) throw new Error("GorContext - you must provide a resolver factory method" );
    return this.config.resolver(entity);
  }

  validator( entity:Entity ) {
    if( ! this.config.validator ) throw new Error("GorContext - you must provide a validator factory method" );
    return this.config.validator(entity);
  }

  entityPermissions( entity:Entity ) {
    if( ! this.config.entityPermissions ) throw new Error("GorContext - you must provide a entityPermissions factory method" );
    return this.config.entityPermissions(entity);
  }

  entitySeeder( entity:Entity ) {
    if( ! this.config.entitySeeder ) throw new Error("GorContext - you must provide a entitySeeder factory method" );
    return this.config.entitySeeder(entity);
  }

  readonly contextUser = this.config.contextUser;
  readonly contextRoles = this.config.contextRoles;
}
