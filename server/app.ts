import YAML from 'yaml';
import { AuthenticationError } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import _ from 'lodash';

import { Runtime } from './graph-on-rails/core/runtime';
import { ResolverContext } from './graph-on-rails/core/resolver-context';

(async () => {

  const app = express();
  app.use('*', cors());
  app.use(compression());

  const virtualResolver = _.set( {},
    'RiskAssessment', {
      priority: (root:any ) => {
        const probability = _.get( root, 'probability');
        const damage = _.get( root, 'damage');
        const result = probability * damage;
        if( result <= 3 ) return 10;
        if( result <= 8 ) return 20;
        return 30;
      }
    }
  );
  const configFolder = ['./server/config-types/d2prom'];

  const domainConfiguration = YAML.parse(`
  entity:
    Alpha:
      attributes:
        name: key
      seeds:
        alpha1:
          name: alpha1
        alpha2:
          name: alpha2
        alpha3:
          name: alpha3

    Beta:
      attributes:
        name: key
      seeds:
        beta1:
          name: beta1
        beta2:
          name: beta2

    AlphaBeta:
      union:
        - Alpha
        - Beta

    Delta:
      attributes:
        name: key
      assocTo: AlphaBeta
      assocFrom: Super
      seeds:
        delta1:
          name: delta1
          AlphaBeta:
            id: alpha1
            type: Alpha
        delta2:
          name: delta2
          AlphaBeta:
            id: alpha2
            type: Alpha
        delta3:
          name: delta3
          AlphaBeta:
            id: beta1
            type: Beta

    Super:
      interface: true
      attributes:
        name: key
      assocTo: Delta

    ImplementA:
      implements: Super
      attributes:
        aAttr: string
      seeds:
        ia1:
          name: ia1
          aAttr: the value 1
          Delta: delta1

    ImplementB:
      implements: Super
      attributes:
        bAttr: int
      seeds:
        ib1:
          name: ib1
          cAttr: 1
          Delta: delta1

  `);
  const runtime = await Runtime.create( "D2PROM", {domainConfiguration } );

  const users:{[token:string]:any} = {
    admin: { id: 100, username: "Admin", roles: ["admin"], clientId: "5ec3b745d3a47f8284414125" },
    thorek: { id: 101, username: "Thorek", roles: ["dsb","user"], clientId: "5ec42368f0d6ec10681dec79"  },
    guest: { id: 102, username: "Guest", roles: ["guest"] }
  };

  const context = (contextExpress: {req: express.Request }) => {
    const token:string = contextExpress.req.headers.authorization || '';
    const user:any = users[token];
    if( ! user ) throw new AuthenticationError( `Token '${token}' cannot be resolved to a valid user.`);
    return { user, context: runtime.context };
  }

  const server = await runtime.server({context});
  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    (): void => { console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`) }
  );

})();

