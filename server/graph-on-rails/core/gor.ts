import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import fs from 'fs';
import { GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';

import { EntityBuilder } from '../builder/entity-builder';
import { EntityConfigBuilder } from '../builder/entity-config-builder';
import { EnumConfigBuilder } from '../builder/enum-config-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { ValidatorFactory } from '../validation/validator';
import { NoResolver } from './no-resolver';
import { Resolver } from './resolver';
import { SchemaFactory } from './schema-factory';

type FolderConfig = {
  resolver:Resolver
  validatorFactory:ValidatorFactory
}

/**
 *
 */
export class Gor {

  private _types?:SchemaBuilder[];
  private _schema?:GraphQLSchema;
  private configs:{[folder:string]:FolderConfig} = {};
  private customEntities:EntityBuilder[] = [];

  /**
   *
   */
  addConfigs( folder:string, resolver:Resolver, validatorFactory:ValidatorFactory ):void {
    this.configs[folder] = {resolver, validatorFactory};
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
    this._schema = factory.createSchema();
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
      if( ! config.resolver ) config.resolver = new NoResolver();
      const files = this.getConfigFiles( folder );
      return _.compact( _.flatten( _.map( files, file => this.createConfigurationTypes( folder, file, config ) ) ) );
    }));
  }

  /**
   *
   */
  private getScalarFilterTypes():SchemaBuilder[] {
    return _.flatten( _.map( this.configs, (config, folder) => {
      if( ! config.resolver ) config.resolver = new NoResolver();
      return config.resolver.getScalarFilterTypes();
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
  private createConfigurationTypes( folder:string, file:string, folderConfig:FolderConfig ):SchemaBuilder[] {
    const builder:SchemaBuilder[] = [];
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const configs = YAML.parse(content);
      builder.push( ... _.map( configs['entity'], (config, name) => EntityConfigBuilder.create(
        name, folderConfig.resolver, folderConfig.validatorFactory, config ) ) );
      builder.push( ... _.map( configs['enum'], (config, name) => EnumConfigBuilder.create(
        name, folderConfig.resolver, config ) ) );
    } catch ( e ){
      console.warn( `[${file}]: ${e}`);
    }
    return builder;
  }

}
