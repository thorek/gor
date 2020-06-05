import { AuthenticationError } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

import { OrganisationalUnit } from './custom-types/organisational-unit';
import { Gor } from './graph-on-rails/core/gor';
import { GorContext } from './graph-on-rails/core/gor-context';

(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());

  const gor = await Gor.create("d2Prom");

  gor.addConfigFolder( './server/config-types/d2prom' );
  gor.addCustomEntities( new OrganisationalUnit() );

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

