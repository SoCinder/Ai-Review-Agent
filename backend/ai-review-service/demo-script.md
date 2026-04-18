# AI Review Service Demo Script

## Overview
This demo showcases the AI Review Service for the DevPilot 2026 project, demonstrating the Agentic RAG workflow, document management, and AI-powered code review capabilities.

## Prerequisites
- Node.js installed
- MongoDB running locally
- All services started (auth-service, projects-service, gateway, ai-review-service)

## Demo Steps

### 1. Service Startup
```bash
# Navigate to ai-review-service
cd backend/ai-review-service

# Install dependencies
npm install

# Start the service
npm start
```

**Expected Output:**
```
MongoDB connected
Sample documents seeded successfully
AI Review Service ready at http://localhost:4003/graphql
```

### 2. GraphQL Playground
Open http://localhost:4003/graphql in your browser.

### 3. Document Management Demo

#### Create a New Document
```graphql
mutation {
  createDocument(input: {
    title: "New API Documentation"
    content: "This document describes the new API endpoints for the authentication service. It includes detailed information about request/response formats, error handling, and security considerations."
    type: "documentation"
    projectId: "sample-project"
    tags: ["api", "documentation", "auth"]
  }) {
    id
    title
    type
    tags
  }
}
```

#### Get All Documents
```graphql
query {
  documents(projectId: "sample-project") {
    id
    title
    type
    tags
    content
  }
}
```

### 4. AI Review Demo

#### Request AI Review
```graphql
mutation {
  createReview(input: {
    userId: "sample-user"
    projectId: "sample-project"
    documentId: "existing-document-id"
    aiOutput: {
      review: "Please review this code for security vulnerabilities, performance issues, and adherence to coding standards. Focus on input validation, error handling, and code organization."
      suggestions: []
      confidence: 0.95
    }
    confidenceScore: 0.95
  }) {
    id
    status
    aiOutput
    confidenceScore
    createdAt
  }
}
```

### 5. Review Status Check
```graphql
query {
  review(id: "review-id") {
    id
    status
    aiOutput
    confidenceScore
    createdAt
    updatedAt
  }
}
```

## Key Features to Highlight

### Agentic RAG Workflow
1. **Document Retrieval**: AI retrieves relevant documents from the knowledge base
2. **Structured Generation**: AI generates structured review output
3. **Reflection**: AI reflects on its own output and provides confidence scores
4. **Citations**: AI includes citations to relevant documents

### Document Management
- Create, update, and delete documents
- Tag-based organization
- Metadata support
- Vector search capabilities

### Security Features
- Session-based authentication
- HTTP-only cookies
- Input validation
- Error handling

## Technical Architecture

### Microservices Integration
- **Auth Service**: User authentication and authorization
- **Projects Service**: Project management and document association
- **Gateway**: Apollo Gateway for GraphQL federation

### Database Schema
- **Reviews Collection**: Stores AI review results
- **Documents Collection**: Stores knowledge documents with embeddings
- **Sessions Collection**: Stores user session data

## Performance Considerations

### Query Optimization
- Indexed queries for fast document retrieval
- Efficient GraphQL resolvers
- Connection pooling for MongoDB

### Caching Strategy
- Apollo Client caching for frontend
- Redis caching for frequently accessed data
- Database query result caching

## Error Handling

### Common Errors
- **Authentication Errors**: Unauthorized access attempts
- **Validation Errors**: Invalid input data
- **Database Errors**: Connection issues or query failures
- **AI Service Errors**: Issues with OpenAI API integration

### Error Response Format
```json
{
  "errors": [
    {
      "message": "Error description",
      "locations": [...],
      "path": [...],
      "extensions": {
        "code": "ERROR_CODE",
        "timestamp": "2026-04-18T11:40:00Z"
      }
    }
  ]
}
```

## Monitoring and Logging

### Key Metrics
- Request latency
- Error rates
- Database query performance
- AI service response times

### Logging Strategy
- Structured logging with correlation IDs
- Error tracking and alerting
- Performance monitoring
- Audit trails for security

## Future Enhancements

### Planned Features
1. **Advanced AI Models**: Integration with more sophisticated AI models
2. **Real-time Collaboration**: Live collaboration features for code reviews
3. **Custom Review Templates**: Configurable review templates for different project types
4. **Integration with CI/CD**: Automated code review in the development pipeline
5. **Multi-language Support**: Support for code reviews in multiple programming languages

### Technical Improvements
1. **Enhanced Vector Search**: More sophisticated similarity search algorithms
2. **Caching Layer**: Implementation of Redis for improved performance
3. **Load Balancing**: Horizontal scaling capabilities
4. **Advanced Security**: Additional security measures and compliance features

## Conclusion

The AI Review Service demonstrates a production-ready implementation of Agentic RAG for code review, with proper microservices architecture, security measures, and integration capabilities. The service is designed to be scalable, maintainable, and extensible for future enhancements.

## Demo Video Structure

1. **Introduction** (1 minute)
   - Overview of the project and service
   - Key features and benefits

2. **Service Setup** (2 minutes)
   - Installation and configuration
   - Service startup and verification

3. **Document Management** (3 minutes)
   - Creating and managing documents
   - Document retrieval and organization

4. **AI Review Process** (4 minutes)
   - Requesting AI reviews
   - Review status tracking
   - Review output analysis

5. **Technical Deep Dive** (3 minutes)
   - Architecture overview
   - Integration with other services
   - Performance considerations

6. **Error Handling and Monitoring** (2 minutes)
   - Error scenarios and handling
   - Monitoring and logging capabilities

7. **Future Enhancements** (1 minute)
   - Planned features and improvements
   - Technical roadmap

8. **Conclusion** (1 minute)
   - Summary of key points
   - Call to action and next steps

**Total Duration**: 17 minutes