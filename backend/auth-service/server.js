require('dotenv').config();

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5'); // ✅ correct for Express 5
const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const mongoose = require('mongoose');
const { buildSubgraphSchema } = require('@apollo/subgraph');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);

  
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  
  const mongoStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  });

  
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: mongoStore,
      cookie: {
        httpOnly: true,
        secure: false,        
        sameSite: 'lax',     
        maxAge: 86400000,     
      },
    })
  );

  
  const subgraphSchema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  const server = new ApolloServer({
    schema: subgraphSchema,
    introspection: true,
  });

  await server.start();

  
  app.use(
    '/graphql',
    cors({
      origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
      credentials: true,
    }),
    express.json(), 
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
        user: req.session?.user || null,
      }),
    })
  );

  const PORT = process.env.PORT || 4001;

  await new Promise((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(` Auth service ready at http://localhost:${PORT}/graphql`);
}

startApolloServer().catch(console.error);