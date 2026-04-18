const Review = require('./models/Review');
const Document = require('./models/Document');

const resolvers = {
  JSON: {
    __parseValue(value) {
      return JSON.parse(value);
    },
    __serialize(value) {
      return JSON.stringify(value);
    }
  },

  Query: {
    reviews: async (_, { userId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Review.find({ userId }).sort({ createdAt: -1 });
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
    }
  },

  Mutation: {
    createReview: async (_, { input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const review = new Review({ ...input, userId: user._id });
      return await review.save();
    },
    updateReview: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Review.findByIdAndUpdate(id, input, { new: true });
    },
    deleteReview: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      await Review.findByIdAndDelete(id);
      return true;
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
    }
  }
};

module.exports = resolvers;