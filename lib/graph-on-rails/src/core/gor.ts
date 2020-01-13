import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import fs from 'fs';
import { GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';

import { Resolver } from './resolver';
import { SchemaFactory } from './schema-factory';
import { NoResolver } from './no-resolver';
import { EntityBuilder } from '../builder/entity-builder';
import { EntityConfigBuilder } from '../builder/entity-config-builder';
import { EnumConfigBuilder } from '../builder/enum-config-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { IntFilterTypeBuilder } from '../filter/int-filter-type-builder';
import { StringFilterTypeBuilder } from '../filter/string-filter-type-builder';

/**
 *
 */
export class Gor {

  private _schema?:GraphQLSchema;
  private configs:{[folder:string]:Resolver} = {};
  private customEntities:EntityBuilder[] = [];

  /**
   *
   */
  addConfigs( folder:string, resolver:Resolver ):void {
    this.configs[folder] = resolver;
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

    const configEntities = this.getConfigTypes();
    const defaultFilterTypes = this.getDefaultFilterTypes();

    const types = [
      ...defaultFilterTypes,
      ...this.customEntities,
      ...configEntities,
    ]

    const factory = new SchemaFactory( types );
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
  private getConfigTypes():SchemaBuilder[] {
    return _.flatten( _.map( this.configs, (resolver, folder) => {
      if( ! resolver ) resolver = new NoResolver();
      const files = this.getConfigFiles( folder );
      return _.compact( _.flatten( _.map( files, file => this.createConfigurationTypes( folder, file, resolver ) ) ) );
    }));
  }

  /**
   *
   */
  private getDefaultFilterTypes():SchemaBuilder[] {
    return [
      new IntFilterTypeBuilder(),
      new StringFilterTypeBuilder()
    ];
  }

  /**
   *
   */
  private getConfigFiles( folder:string ):string[] {
    try {
      return _.filter( fs.readdirSync( folder ), file => _.toLower( path.extname( file )) === '.yaml' );
    } catch (error) {
      console.error( `cannot read files from folder '${folder}'`, error );
      return [];
    }
  }

  /**
   *
   */
  private createConfigurationTypes( folder:string, file:string, resolver:Resolver ):SchemaBuilder[] {
    const builder:SchemaBuilder[] = [];
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const configs = YAML.parse(content);
      builder.push( ... _.map( configs['entity'], (config, name) => EntityConfigBuilder.create( name, resolver, config ) ) );
      builder.push( ... _.map( configs['enum'], (config, name) => EnumConfigBuilder.create( name, resolver, config ) ) );
    } catch ( e ){
      console.warn( `[${file}]: ${e}`);
    }
    return builder;
  }

}
