require('dotenv').config();

const { ApolloServer } = require('@apollo/server');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { expressMiddleware } = require('@as-integrations/express5');
const { ApolloGateway, RemoteGraphQLDataSource, IntrospectAndCompose } = require('@apollo/gateway');

async function start() {
  const app = express();
  const httpServer = http.createServer(app);

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'auth', url: 'http://localhost:4001/graphql' },
        { name: 'projects', url: 'http://localhost:4002/graphql' },
        { name: 'ai-review', url: 'http://localhost:4003/graphql' }
      ]
    }),

    buildService({ url }) {
      return new (class extends RemoteGraphQLDataSource {
        willSendRequest({ request, context }) {
          if (context?.req?.headers?.cookie) {
            request.http?.headers.set('cookie', context.req.headers.cookie);
          }
        }

        
        didReceiveResponse({ response, context }) {
          const setCookie = response.http.headers.get('set-cookie');
          if (setCookie && context?.res) {
            context.res.setHeader('set-cookie', setCookie);
          }
          return response;
        }
      })({ url });
    }
  });

  const server = new ApolloServer({ gateway });

  await server.start();

  app.use(
    '/graphql',
    cors({
      origin: ['http://localhost:3000', 'http://localhost:3003'],
      credentials: true,
    })
  );

  app.use('/graphql', express.json());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res })
    })
  );

  const PORT = process.env.PORT || 4000;

  await new Promise((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(` Gateway ready at http://localhost:${PORT}/graphql`);
}

start().catch(console.error);