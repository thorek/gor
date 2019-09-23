import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { MongoClient } from 'mongodb';

import { SchemaFactory } from './core/schema-factory';
import { IntFilterAttributeType } from './filter-attributes/int-filter-attribute.type';
import { StringFilterAttributeType } from './filter-attributes/string-filter-attribute.type';
import { AddressType } from './schema-types/adress.type';
import { PersonType } from './schema-types/person.type';

export class GraphQLServer {

	/**
	 *
	 */
	public static async server(): Promise<ApolloServer> {

		const url = 'mongodb://localhost:27017';
		const dbName = 'ae_one';
		const client = await MongoClient.connect( url, { useNewUrlParser: true, useUnifiedTopology: true } );
		const db = client.db(dbName);

		const types = [
			new PersonType( db ),
			new AddressType( db ),
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
}
