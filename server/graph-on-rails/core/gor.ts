import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import fs from 'fs';
import { GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';

import { EntityBuilder } from '../builder/entity-builder';
import { EntityConfigBuilder } from '../builder/entity-config-builder';
import { EntityPermissions } from '../builder/entity-permissions';
import { EnumConfigBuilder } from '../builder/enum-config-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { Validator } from '../validation/validator';
import { Resolver } from './resolver';
import { SchemaFactory } from './schema-factory';
import { GraphX } from './graphx';


export type GorConfig = {
  resolver: (entity?:EntityBuilder) => Resolver
  validator:(entity:EntityBuilder) => Validator
  entityPermissions:(entity:EntityBuilder) => EntityPermissions
  contextUser?:string
  contextRoles?:string
}

/**
 *
 */
export class Gor {

  private _types?:SchemaBuilder[];
  private _schema?:GraphQLSchema;
  private configs:{[folder:string]:GorConfig} = {};
  private customEntities:EntityBuilder[] = [];

  graphx:GraphX = new GraphX();

  /**
   *
   */
  addConfigs( folder:string, gorConfig:GorConfig ):void {
    this.configs[folder] = gorConfig;
  }

  /**
   *
   */
  addCustomEntities( ...types:EntityBuilder[] ):void {
    this.customEntities.push( ...types );
  }

  /**
   *
   */
  async schema():Promise<GraphQLSchema> {
    if( this._schema ) return this._schema;
    const factory = SchemaFactory.create( this.types() );
    this._schema = factory.createSchema( this.graphx );
    return this._schema;
  }

	/**
	 *
	 */
	async server( config:ApolloServerExpressConfig = {} ): Promise<ApolloServer> {
    config.schema = await this.schema();
    _.defaults( config, { validationRules: [depthLimit(7)] } );
    return new ApolloServer( config );
  }

  /**
   *
   */
  private types() {
    if( this._types ) return this._types;
    const configEntities = this.getConfigTypes();
    const defaultFilterTypes = this.getScalarFilterTypes();
    this._types = [
      ...defaultFilterTypes,
      ...this.customEntities,
      ...configEntities,
    ];
    return this._types;
  }

  /**
   *
   */
  private getConfigTypes():SchemaBuilder[] {
    return _.flatten( _.map( this.configs, (config, folder) => {
      const files = this.getConfigFiles( folder );
      return _.compact( _.flatten( _.map( files, file => this.createConfigurationTypes( folder, file, config ) ) ) );
    }));
  }

  /**
   *
   */
  private getScalarFilterTypes():SchemaBuilder[] {
    return _.flatten( _.map( this.configs, (config, folder) => {
      return config.resolver().getScalarFilterTypes();
    }));

  }


  /**
   *
   */
  private getConfigFiles( folder:string ):string[] {
    try {
      return _.filter( fs.readdirSync( folder ), file => this.isConfigFile(file) );
    } catch (error) {
      console.error( `cannot read files from folder '${folder}'`, error );
      return [];
    }
  }

  /**
   *
   */
  private isConfigFile( file:string ):boolean {
    const extension = _.toLower( path.extname( file ));
    return _.includes( ['.yaml', '.yml'], extension );
  }

  /**
   *
   */
  private createConfigurationTypes( folder:string, file:string, gorConfig:GorConfig ):SchemaBuilder[] {
    const builder:SchemaBuilder[] = [];
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const configs = YAML.parse(content);
      if( _.get( configs, "entity.Client.permissions" ) ) console.log( configs.entity.Client )
      builder.push( ... _.map( configs['entity'], (entityConfig, name) => EntityConfigBuilder.create(
        name, gorConfig, entityConfig ) ) );
      builder.push( ... _.map( configs['enum'], (enumConfig, name) => EnumConfigBuilder.create(
        name, gorConfig, enumConfig ) ) );
    } catch ( e ){
      console.warn( `[${file}]: ${e}`);
    }
    return builder;
  }

}
