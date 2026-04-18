require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const mongoose = require('mongoose');
const { buildSubgraphSchema } = require('@apollo/subgraph');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { seedDocuments } = require('./sample-documents');

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
      }),
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 86400000
      }
    })
  );

  const subgraphSchema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  const server = new ApolloServer({
    schema: subgraphSchema,
    introspection: true,
  });

  await server.start();

  // GraphQL endpoint
  app.use(
    '/graphql',
    cors({
      origin: true,
      credentials: true
    }),
    express.json(),
    expressMiddleware(server, {
      context: ({ req, res }) => ({
        req,
        res,
        user: req.session?.user || null
      })
    })
  );

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  // Seed sample documents
  seedDocuments().catch(console.error);

  const PORT = process.env.PORT || 4003;   
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`AI Review Service ready at http://localhost:${PORT}/graphql`);
}

startApolloServer().catch(console.error);