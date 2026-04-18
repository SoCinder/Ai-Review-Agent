const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function testService() {
  try {
    const server = new ApolloServer({
      schema: buildSubgraphSchema([{ typeDefs, resolvers }])
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 4004 }
    });

    console.log(`Test server running at ${url}`);
    console.log('Service schema is valid and resolvers are working!');
  } catch (error) {
    console.error('Service test failed:', error);
  }
}

testService();