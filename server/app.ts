import { GraphQLServer } from './graphql-server';
import express from 'express';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';

const app = express();

app.use('*', cors());
app.use(compression());

GraphQLServer.server().then( server => {
  server.applyMiddleware({ app, path: '/graphql' });
  const httpServer = createServer(app);

  httpServer.listen(
    { port: 3000 },
    (): void => {
      console.log(`\n🚀 GraphQL is now running on http://localhost:3000/graphql\n`)
    });
  }
);
