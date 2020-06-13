import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import fs from 'fs';
import { GraphQLSchema, GraphQLString, GraphQLInt } from 'graphql';
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
import { EnumBuilder } from 'graph-on-rails/builder/enum-builder';

type DefinitionType = {
  enum:{[name:string]:{}}
  entity:{[name:string]:{}}
}

/**
 *
 */
export class Runtime {

  private _builders?:SchemaBuilder[];
  private _schema?:GraphQLSchema;
  private configFolders:string[] = [];
  private customBuilders:SchemaBuilder[] = [];

  private constructor( public readonly context:GorContext ){}

  /**
   *
   */
  static async create( config:GorConfig|string = "default" ):Promise<Runtime>{
    const context = await GorContext.create( config );
    return new Runtime( context );
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
  addCustomBuilder( ... builder:SchemaBuilder[] ):void {
    this.customBuilders.push( ... builder );
  }

  /**
   *
   */
  addCustomEntities( ...entities:Entity[] ):void {
    this.customBuilders.push( ... _.map( entities, entity => new EntityBuilder( entity ) ) );
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
    const configTypeBuilders = this.getConfigTypeBuilder();
    const scalarFilterTypeBuilders = this.context.resolver.getScalarFilterTypes();
    this._builders = [
      ...scalarFilterTypeBuilders,
      ...configTypeBuilders,
      ...this.customBuilders
    ];
    return this._builders;
  }


  /**
   *
   */
  private getConfigTypeBuilder():SchemaBuilder[] {
    const configs = this.getConfigDefinitions();
    const builder:SchemaBuilder[] = _.compact( _.map( configs.entity,
      (config, name) => this.createEntityBuilder( name, config )) );
    builder.push( ... _.compact( _.map( configs.enum,
    (config, name) => this.createEnumBuilder( name, config )) ) )
    return builder;
  }


  /**
   *
   */
  private getConfigDefinitions():DefinitionType {
    const configs:DefinitionType = { enum: {}, entity: {} };
    _.forEach( this.configFolders, folder => {
      const files = this.getConfigFiles( folder );
      _.forEach( files, file => this.parseConfigFile( configs, folder, file ) );
    });
    return configs;
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
  private parseConfigFile( configs:any, folder:string, file:string ):void {
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const config = YAML.parse(content);
      _.merge( configs, config );
    } catch ( error ){
      console.warn( `Error parsing file [${file}]:`, error );
    }
  }

  /**
   *
   */
  private createEntityBuilder( name:string, config:any ):undefined|EntityBuilder {
    try {
      const entity = ConfigEntity.create(name, config );
      return new EntityBuilder( entity );
    } catch (error) {
      console.log( `Error building entity [${name}]`, error );
    }
  }

  /**
   *
   */
  private createEnumBuilder( name:string, config:any ):undefined|EnumBuilder{
    try {
      return EnumConfigBuilder.create( name, config );
    } catch (error) {
      console.log( `Error building enum [${name}]`, error );
    }
  }


}
