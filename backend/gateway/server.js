require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const { expressMiddleware } = require('@as-integrations/express5');
const { ApolloGateway } = require('@apollo/gateway');

async function start() {
  const app = express();
  const httpServer = http.createServer(app);

  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'auth', url: 'http://localhost:4001/graphql' },
      { name: 'projects', url: 'http://localhost:4002/graphql' }
    ],
    buildService({ url }) {
      return new (class extends require('@apollo/gateway').RemoteGraphQLDataSource {
        willSendRequest({ request, context }) {
          if (context?.req?.headers?.cookie) {
            request.http?.headers.set('cookie', context.req.headers.cookie);
          }
        }
      })({ url });
    }
  });

  const server = new ApolloServer({ gateway });

  await server.start();

  app.use('/graphql', cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use('/graphql', json());

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res })
  }));

  const PORT = process.env.PORT || 4000;
  await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Gateway ready at http://localhost:${PORT}/graphql`);
}

start().catch(console.error);