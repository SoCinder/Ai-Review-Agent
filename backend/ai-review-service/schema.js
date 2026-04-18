const { gql } = require('graphql-tag');

module.exports = gql`
  type Query {
    reviews(userId: ID!): [Review!]!
    review(id: ID!): Review
    documents(projectId: ID!): [Document!]!
    document(id: ID!): Document
  }

  type Mutation {
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
    createDocument(input: CreateDocumentInput!): Document!
    updateDocument(id: ID!, input: UpdateDocumentInput!): Document!
    deleteDocument(id: ID!): Boolean!
  }

  type Review {
    id: ID!
    userId: ID!
    projectId: ID!
    documentId: ID!
    aiOutput: JSON!
    confidenceScore: Float!
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

  input CreateReviewInput {
    userId: ID!
    projectId: ID!
    documentId: ID!
    aiOutput: JSON!
    confidenceScore: Float!
  }

  input UpdateReviewInput {
    aiOutput: JSON
    confidenceScore: Float
    status: String
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