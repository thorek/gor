import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import fs from 'fs';
import { GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';

import { EntityBuilder } from '../builder/entity-builder';
import { EnumConfigBuilder } from '../builder/enum-config-builder';
import { SchemaBuilder } from '../builder/schema-builder';
import { ConfigEntity } from '../entities/config-entity';
import { Entity } from '../entities/entity';
import { GorConfig, GorContext } from './gor-context';
import { SchemaFactory } from './schema-factory';


/**
 *
 */
export class Gor {

  private _builders?:SchemaBuilder[];
  private _schema?:GraphQLSchema;
  private configFolders:string[] = [];
  private customEntities:Entity[] = [];

  private constructor( public readonly context:GorContext ){}

  /**
   *
   */
  static async create( config:GorConfig|string = "default" ):Promise<Gor>{
    const context = await GorContext.create( config );
    return new Gor( context );
  }

  /**
   *
   */
  addConfigFolder( folder:string ):void {
    this.configFolders.push( folder );
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
    this._schema = factory.createSchema( this.context );
    return this._schema;
  }

	/**
	 *
	 */
	async server( config:ApolloServerExpressConfig = {} ): Promise<ApolloServer> {
    config.schema = await this.schema();
    _.defaultsDeep( config, { validationRules: [depthLimit(7)], context: { gorContext: this.context } } );
    return new ApolloServer( config );
  }

  /**
   *
   */
  private builders() {
    if( this._builders ) return this._builders;
    const domainBuilders = this.getDomainBuilders();
    const defaultFilterBuilders = this.context.resolver.getScalarFilterTypes();
    this._builders = [
      ...defaultFilterBuilders,
      ...domainBuilders
    ];
    return this._builders;
  }

  /**
   *
   */
  private getDomainBuilders():SchemaBuilder[] {
    const entitiesOrBuilders = _.concat( this.getConfigEntities(), this.customEntities );
    return _.map( entitiesOrBuilders, entityOrBuilder => {
      return entityOrBuilder instanceof Entity ? new EntityBuilder( entityOrBuilder ) : entityOrBuilder;
    });
  }

  /**
   *
   */
  private getConfigEntities():(Entity|SchemaBuilder)[] {
    return _.flatten( _.map( this.configFolders, folder => {
      const files = this.getConfigFiles( folder );
      return _.compact( _.flatten( _.map( files, file => this.createConfigurationTypes( folder, file ) ) ) );
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
  private createConfigurationTypes( folder:string, file:string ):(Entity|SchemaBuilder)[] {
    const builder:(ConfigEntity|EnumConfigBuilder)[] = [];
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const configs = YAML.parse(content);
      builder.push( ... _.map( configs['entity'], (entityConfig, name) => ConfigEntity.create(
        name, entityConfig ) ) );
      builder.push( ... _.map( configs['enum'], (enumConfig, name) => EnumConfigBuilder.create(
        name, enumConfig ) ) );
    } catch ( e ){
      console.warn( `[${file}]: ${e}`);
    }
    return builder;
  }

}
