require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const mongoose = require('mongoose');
const { buildSubgraphSchema } = require('@apollo/subgraph');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Create MongoDB session store
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const mongoStore = await MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    stringify: false,
  });

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: mongoStore,
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
    json(),
    expressMiddleware(server, {
      context: ({ req, res }) => ({
        req,
        res,
        user: req.session?.user || null
      })
    })
  );

  const PORT = process.env.PORT || 4001;  
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Subgraph ready at http://localhost:${PORT}/graphql`);
}

startApolloServer().catch(console.error);