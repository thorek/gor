import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { MongoClient } from 'mongodb';

import { SchemaFactory } from './core/schema-factory';
import { IntFilterAttributeType } from './filter-attributes/int-filter-attribute.type';
import { StringFilterAttributeType } from './filter-attributes/string-filter-attribute.type';
import { AddressType } from './schema-types/adress.type';
import { PersonType } from './schema-types/person.type';
import { VersionedMongoDbResolver } from './resolvers/versioned-mongodb.resolver';
import { ConfigurationType } from './core/configuration-entity';
import { EntityConfig } from './core/entity-config';
import { Resolver } from './core/resolver';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import YAML from 'yaml';

export class GorServerBuilder {

	/**
	 *
	 */
	public static async server(): Promise<ApolloServer> {

    const resolver = await this.getResolver();
    const configEntities = this.getConfigEntities( resolver );

    const customEntities = [
      new PersonType( resolver ),
			new AddressType( resolver )
    ];

		const types = [
      ...configEntities,
      ...customEntities,
			new IntFilterAttributeType(),
			new StringFilterAttributeType(),
		]

		const factory = new SchemaFactory( types );
		const schema = factory.createSchema();

		return new ApolloServer({
			schema,
			validationRules: [depthLimit(7)],
		});
	}

  /**
   *
   */
  private static async getResolver():Promise<Resolver> {
		const url = 'mongodb://localhost:27017';
		const dbName = 'ae_one';
		const client = await MongoClient.connect( url, { useNewUrlParser: true, useUnifiedTopology: true } );
    const db = client.db(dbName);

    return new VersionedMongoDbResolver( db );
  }

  /**
   *
   */
  private static getConfigEntities( resolver:Resolver ):ConfigurationType[] {
    const folder = './server/schema-types';
    const files = _.filter( fs.readdirSync( folder ), file => _.toLower( path.extname( file )) === '.yaml' );
    return _.compact( _.map( files, file => this.createConfigurationType( folder, file, resolver ) ) );
  }

  /**
   *
   */
  private static createConfigurationType( folder:string, file:string, resolver:Resolver ):ConfigurationType | null {
    try {
      file = path.join( folder, file );
      const content = fs.readFileSync( file).toString();
      const config = _.get( YAML.parse(content), 'entity' ) as EntityConfig;
      return ConfigurationType.create( resolver, config );
    } catch ( e ){
      console.warn( `[${file}]: ${e}`);
      return null;
    }
  }

}
