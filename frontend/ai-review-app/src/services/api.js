import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include'
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

export const API_BASE_URL = 'http://localhost:4000';