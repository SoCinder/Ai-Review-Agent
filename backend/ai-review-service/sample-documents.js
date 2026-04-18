const Document = require('./models/Document');

const sampleDocuments = [
  {
    title: "Project Requirements Document",
    content: "This document outlines the requirements for the DevPilot 2026 project. The project aims to create an AI-powered code review system with Agentic RAG capabilities. Key features include multi-step workflow, structured AI output, reflection, citations, and confidence scores. The system should integrate with existing microservices and micro frontends architecture.",
    type: "requirements",
projectId: "64b1f8e5e4b0a1c8e4b0a1c8",
    tags: ["requirements", "project", "devpilot"],
    metadata: {
      source: "internal",
      version: "1.0"
    }
  },
  {
    title: "System Architecture Design",
    content: "The DevPilot 2026 system uses a microservices architecture with Apollo Gateway for GraphQL federation. Key services include auth-service, projects-service, and ai-review-service. The frontend consists of micro frontends built with React/Next.js and Tailwind CSS. MongoDB is used for data persistence with vector search capabilities for AI document retrieval.",
    type: "design",
projectId: "64b1f8e5e4b0a1c8e4b0a1c8",
    tags: ["architecture", "design", "microservices"],
    metadata: {
      source: "internal",
      version: "1.0"
    }
  },
  {
    title: "Code Review Guidelines",
    content: "Code reviews should focus on code quality, security, performance, and maintainability. Key aspects include proper error handling, code organization, documentation, testing coverage, and adherence to coding standards. Reviews should provide constructive feedback with specific examples and actionable recommendations.",
    type: "documentation",
projectId: "64b1f8e5e4b0a1c8e4b0a1c8",
    tags: ["guidelines", "code-review", "best-practices"],
    metadata: {
      source: "internal",
      version: "1.0"
    }
  }
];

async function seedDocuments() {
  try {
await Document.deleteMany({ projectId: "64b1f8e5e4b0a1c8e4b0a1c8" });
    await Document.insertMany(sampleDocuments);
    console.log('Sample documents seeded successfully');
  } catch (error) {
    console.error('Error seeding documents:', error);
  }
}

module.exports = { seedDocuments, sampleDocuments };