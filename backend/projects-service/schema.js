const { gql } = require('graphql-tag');

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0",
          import: ["@key", "@external"])

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  type Project {
    id: ID!
    title: String!
    description: String!
    owner: User!
    createdAt: String
    updatedAt: String
  }

  type FeatureRequest {
    id: ID!
    projectId: ID!
    title: String!
    description: String!
    status: String
    createdAt: String
  }

  type ImplementationDraft {
    id: ID!
    featureId: ID!
    author: User!
    content: String!
    version: Int
    createdAt: String
  }

  type Query {
    projectsByUser: [Project!]!
    project(id: ID!): Project
    featureRequests(projectId: ID!): [FeatureRequest!]!
    draftsByFeature(featureId: ID!): [ImplementationDraft!]!
  }

  type Mutation {
    createProject(title: String!, description: String!): Project!
    addFeatureRequest(projectId: ID!, title: String!, description: String!): FeatureRequest!
    submitDraft(featureId: ID!, content: String!, version: Int): ImplementationDraft!
  }
`;

module.exports = typeDefs;