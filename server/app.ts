import { AuthenticationError } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { EntityBuilder } from './graph-on-rails/builder/entity-builder';
import { EntityPermissions } from './graph-on-rails/builder/entity-permissions';
import { createServer } from 'http';

import { OrganisationalUnit } from './custom-types/organisational-unit';
import { MongoDbResolver } from './graph-on-rails-mongodb/mongodb.resolver';
import { Gor, GorConfig } from './graph-on-rails/core/gor';
import { ValidateJs } from './graph-on-rails/validation/validate-js';

(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());

  const gor = new Gor();
  const resolver = await MongoDbResolver.create( { url: 'mongodb://localhost:27017', dbName: 'd2prom' } );

  const config:GorConfig = {
    resolver: () => resolver,
    validator: (entity:EntityBuilder) => new ValidateJs( entity ),
    entityPermissions: (entity:EntityBuilder) => new EntityPermissions( entity ),
    contextUser: "user",
    contextRoles: "roles"
  };

  gor.addConfigs( './server/config-types/d2prom', config );
  gor.addCustomEntities( new OrganisationalUnit( config ) );

  const users:{[token:string]:any} = {
    admin: { id: 100, username: "Admin", roles: ["admin"], clientId: "5ec3b745d3a47f8284414125" },
    thorek: { id: 101, username: "Thorek", roles: ["dsb","user"], clientId: "5ec42368f0d6ec10681dec79"  },
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

