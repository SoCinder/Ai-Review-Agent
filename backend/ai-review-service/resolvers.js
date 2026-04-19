const Review = require('./models/Review');
const Document = require('./models/Document');
const GraphQLJSON = require('graphql-type-json');

const pipelinePromise = import('./services/pipeline.js');

const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    reviews: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Review.find({ userId: user.id }).sort({ createdAt: -1 });
    },
    review: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Review.findById(id);
    },
    documents: async (_, { projectId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Document.find({ projectId }).sort({ createdAt: -1 });
    },
    document: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Document.findById(id);
    },
  },

  Mutation: {
    reviewDraft: async (_, { draftText, draftId = null }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const { runReviewPipeline } = await pipelinePromise;
      const result = await runReviewPipeline({ draftText, draftId });
      const review = new Review({
        userId: user.id,
        draftId: result.draftId ?? draftId,
        summary: result.summary,
        issues: result.issues,
        suggestions: result.suggestions,
        citations: result.citations,
        retrievedChunks: result.retrievedChunks,
        initialConfidence: result.initialConfidence,
        finalConfidence: result.finalConfidence,
        reflectionNotes: result.reflectionNotes,
        evidenceStatus: result.evidenceStatus,
        status: 'completed',
      });
      return await review.save();
    },
    createDocument: async (_, { input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const document = new Document({ ...input });
      return await document.save();
    },
    updateDocument: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Document.findByIdAndUpdate(id, input, { new: true });
    },
    deleteDocument: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      await Document.findByIdAndDelete(id);
      return true;
    },
  },
};

module.exports = resolvers;
