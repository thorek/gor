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
import { EntityConfigBuilder, EntityConfig } from '../builder/entity-config-builder';
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

    const configEntities = this.getConfigEntities();
    const defaultFilterTypes = this.getDefaultFilterTypes();

    const types = [
      ...this.customEntities,
      ...configEntities,
      ...defaultFilterTypes
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
  private getConfigEntities():EntityConfigBuilder[] {
    return _.flatten( _.map( this.configs, (resolver, folder) => {
      if( ! resolver ) resolver = new NoResolver();
      const files = this.getConfigFiles( folder );
      return _.compact( _.map( files, file => this.createConfigurationType( folder, file, resolver ) ) );
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
      console.log( __dirname );
      return _.filter( fs.readdirSync( folder ), file => _.toLower( path.extname( file )) === '.yaml' );
    } catch (error) {
      console.error( `cannot read files from folder '${folder}'`, error );
      return [];
    }
  }

  /**
   *
   */
  private createConfigurationType( folder:string, file:string, resolver:Resolver ):EntityConfigBuilder | null {
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const config = _.get( YAML.parse(content), 'entity' ) as EntityConfig;
      return EntityConfigBuilder.create( resolver, config );
    } catch ( e ){
      console.warn( `[${file}]: ${e}`);
      return null;
    }
  }

}
