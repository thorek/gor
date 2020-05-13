import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Gor } from './graph-on-rails/core/gor';
import { MongoDbResolver } from './graph-on-rails-mongodb/mongodb.resolver';
import { AddressType } from './custom-types/adress';

(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());

  const gor = new Gor();
  const resolver = await MongoDbResolver.create( { url: 'mongodb://localhost:27017', dbName: 'd2prom' } );
  gor.addConfigs( './server/config-types/d2prom', resolver );
  // gor.addCustomEntities( new AddressType( resolver ) );

  const server = await gor.server();
  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    (): void => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

