import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Gor } from 'graph-on-rails';
import { MongoDbResolver } from 'graph-on-rails-mongodb';
import { AddressType } from './types/adress.type';
import { PersonType } from './types/person.type';


(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());

  const gor = new Gor();
  const resolver = await MongoDbResolver.create( { url: 'mongodb://localhost:27017', dbName: 'gor1' } );
  gor.addConfigs( './server/types', resolver );
  gor.addCustomEntities([
    new PersonType( resolver ),
    new AddressType( resolver )
  ]);

  const schema = await gor.schema();
  console.log( 'generated schema', schema );
  const server = await gor.server();
  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    (): void => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

