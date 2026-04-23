const { gql } = require('graphql-tag');

module.exports = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0",
          import: ["@key", "@external"])

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  type Query {
    reviews: [Review!]!
    review(id: ID!): Review
    documents(projectId: ID!): [Document!]!
    document(id: ID!): Document
  }

  type Mutation {
    reviewDraft(draftText: String!, draftId: ID): Review!
    createDocument(input: CreateDocumentInput!): Document!
    updateDocument(id: ID!, input: UpdateDocumentInput!): Document!
    deleteDocument(id: ID!): Boolean!
  }

  type Issue {
    type: String!
    severity: String!
    description: String!
  }

  type RetrievedChunk {
    sourceId: String!
    source: String!
    title: String
    content: String!
  }

  type Review {
    id: ID!
    userId: ID!
    draftId: ID
    summary: String!
    issues: [Issue!]!
    suggestions: [String!]!
    citations: [String!]!
    retrievedChunks: [RetrievedChunk!]!
    initialConfidence: Float!
    finalConfidence: Float!
    reflectionNotes: [String!]!
    evidenceStatus: String
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type Document {
    id: ID!
    title: String!
    content: String!
    type: String!
    projectId: ID!
    tags: [String!]!
    embeddings: JSON
    metadata: JSON!
    createdAt: String!
    updatedAt: String!
  }

  input CreateDocumentInput {
    title: String!
    content: String!
    type: String!
    projectId: ID!
    tags: [String!]
    embeddings: JSON
    metadata: JSON
  }

  input UpdateDocumentInput {
    title: String
    content: String
    type: String
    tags: [String!]
    embeddings: JSON
    metadata: JSON
  }

  scalar JSON
`;
