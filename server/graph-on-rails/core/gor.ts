import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import fs from 'fs';
import { GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';

import { EntityBuilder } from '../builder/entity-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { ConfigEntity } from '../entities/config-entity';
import { Entity } from '../entities/entity';
import { GraphX } from './graphx';
import { SchemaFactory } from './schema-factory';
import { GorContext } from './gor-context';


/**
 *
 */
export class Gor {

  private _builders?:SchemaBuilder[];
  private _schema?:GraphQLSchema;
  private configs:{[folder:string]:GorContext} = {};
  private customEntities:Entity[] = [];

  graphx:GraphX = new GraphX();

  /**
   *
   */
  addConfigs( folder:string, gorContext:GorContext ):void {
    this.configs[folder] = gorContext;
  }

  /**
   *
   */
  addCustomEntities( ...entities:Entity[] ):void {
    this.customEntities.push( ...entities );
  }

  /**
   *
   */
  async schema():Promise<GraphQLSchema> {
    if( this._schema ) return this._schema;
    const factory = SchemaFactory.create( this.builders() );
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
  private builders() {
    if( this._builders ) return this._builders;
    const entities = this.initEntities();
    const entityBuilders = _.map( entities, entity => new EntityBuilder( entity ) );
    const defaultFilterBuilders = this.getScalarFilterBuilder();
    this._builders = [
      ...defaultFilterBuilders,
      ...entityBuilders
    ];
    return this._builders;
  }

  /**
   *
   */
  private initEntities():Entity[] {
    const entities = _.concat( this.getConfigEntities(), this.customEntities );
    _.forEach( entities, entity => entity.init( this.graphx ));
    return entities;
  }

  /**
   *
   */
  private getConfigEntities():Entity[] {
    return _.flatten( _.map( this.configs, (context, folder) => {
      const files = this.getConfigFiles( folder );
      return _.compact( _.flatten( _.map( files, file => this.createConfigurationTypes( folder, file, context ) ) ) );
    }));
  }

  /**
   *
   */
  private getScalarFilterBuilder():SchemaBuilder[] {
    return _.flatten( _.map( _.uniq(_.values( this.configs ) ), context => context.resolver().getScalarFilterTypes() ) );
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
  private createConfigurationTypes( folder:string, file:string, gorContext:GorContext ):Entity[] {
    const builder:ConfigEntity[] = [];
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const configs = YAML.parse(content);
      if( _.get( configs, "entity.Client.permissions" ) ) console.log( configs.entity.Client )
      builder.push( ... _.map( configs['entity'], (entityConfig, name) => ConfigEntity.create(
        name, gorContext, entityConfig ) ) );
      builder.push( ... _.map( configs['enum'], (enumConfig, name) => ConfigEntity.create(
        name, gorContext, enumConfig ) ) );
    } catch ( e ){
      console.warn( `[${file}]: ${e}`);
    }
    return builder;
  }

}
