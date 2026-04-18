# AI Review Service

The AI Review Service is a GraphQL microservice for the DevPilot 2026 project that provides AI-powered code review capabilities using Agentic RAG (Retrieval-Augmented Generation).

## Features

- **Agentic RAG Workflow**: Multi-step AI review process with document retrieval, structured generation, and reflection
- **Vector Search**: MongoDB vector search for efficient document retrieval
- **Structured AI Output**: Consistent AI review output with confidence scores and citations
- **Session-based Authentication**: Secure authentication using HTTP-only cookies
- **GraphQL API**: Federated GraphQL API integrated with Apollo Gateway
- **Document Management**: Create, update, and manage knowledge documents for AI training

## Architecture

The service follows the existing microservices architecture with:

- **Database**: MongoDB with vector search capabilities
- **API**: GraphQL with Apollo Server
- **Authentication**: Session-based using express-session and connect-mongo
- **Integration**: Federated with Apollo Gateway

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/ai-review
   SESSION_SECRET=your-secret-key
   PORT=4003
   ```

3. **Start the Service**
   ```bash
   npm start
   ```

4. **Access the GraphQL Playground**
   - URL: http://localhost:4003/graphql

## API Endpoints

- **GraphQL**: `/graphql` - Main API endpoint
- **Playground**: `/graphql` - GraphQL Playground for testing

## GraphQL Schema

The service provides the following types and operations:

### Types
- `Review`: AI review results with confidence scores
- `Document`: Knowledge documents for AI training
- `JSON`: Custom scalar for JSON data

### Queries
- `reviews(userId: ID!)`: Get all reviews for a user
- `review(id: ID!)`: Get a specific review
- `documents(projectId: ID!)`: Get all documents for a project
- `document(id: ID!)`: Get a specific document

### Mutations
- `createReview(input: CreateReviewInput!)`: Create a new AI review
- `updateReview(id: ID!, input: UpdateReviewInput!)`: Update an existing review
- `deleteReview(id: ID!)`: Delete a review
- `createDocument(input: CreateDocumentInput!)`: Create a new document
- `updateDocument(id: ID!, input: UpdateDocumentInput!)`: Update a document
- `deleteDocument(id: ID!)`: Delete a document

## Sample Documents

The service includes sample knowledge documents for testing:
- Project Requirements Document
- System Architecture Design
- Code Review Guidelines

## Integration

The AI Review Service integrates with the existing microservices architecture:

- **Auth Service**: For user authentication and authorization
- **Projects Service**: For project management and document association
- **Gateway**: Apollo Gateway for GraphQL federation

## Development

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/ai-review` |
| `SESSION_SECRET` | Session encryption key | Required |
| `PORT` | Service port | `4003` |

### Testing

The service includes basic testing setup. Run tests with:
```bash
npm test
```

## Deployment

For production deployment, ensure:

1. MongoDB is properly configured and secured
2. Environment variables are set appropriately
3. The service is behind a reverse proxy (e.g., Nginx)
4. Proper monitoring and logging are in place

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.