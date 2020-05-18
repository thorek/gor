import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

import { OrganisationalUnit } from './custom-types/organisational-unit';
import { MongoDbResolver } from './graph-on-rails-mongodb/mongodb.resolver';
import { Gor } from './graph-on-rails/core/gor';
import { ValidateJsFactory } from './graph-on-rails/validation/validate-js';
import { AuthenticationError } from 'apollo-server-express';

(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());

  const gor = new Gor();
  const resolver = await MongoDbResolver.create( { url: 'mongodb://localhost:27017', dbName: 'd2prom' } );
  const validatorFactory = new ValidateJsFactory();
  gor.addConfigs( './server/config-types/d2prom', resolver, validatorFactory );
  gor.addCustomEntities( new OrganisationalUnit( resolver, validatorFactory ) );

  const users:{[token:string]:any} = {
    admin: { id: 100, username: "Admin", roles: ['admin'] },
    thorek: { id: 101, username: "Thorek", roles: ["dsb","user"] },
    guest: { id: 102, username: "Guest", roles: ["guest"] }
  };

  const context = (contextExpress: {req: express.Request }) => {
    const token:string = contextExpress.req.headers.authorization || '';
    const user:any = users[token];
    if( ! user ) throw new AuthenticationError( `Token '${token}' cannot be resolved to a valid user.`);
    return { user };
  }

  const server = await gor.server({context});
  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    (): void => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

