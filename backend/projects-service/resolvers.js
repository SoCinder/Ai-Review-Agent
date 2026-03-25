const Project = require('./models/Project');
const FeatureRequest = require('./models/FeatureRequest');
const ImplementationDraft = require('./models/ImplementationDraft');

const resolvers = {
  Project: {
    owner: (parent) => ({ __typename: 'User', id: parent.owner })
  },
  ImplementationDraft: {
    author: (parent) => ({ __typename: 'User', id: parent.author })
  },
  Query: {
    projectsByUser: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return Project.find({ owner: user.id });
    },
    project: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return Project.findById(id);
    },
    featureRequests: async (_, { projectId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return FeatureRequest.find({ projectId });
    },
    draftsByFeature: async (_, { featureId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return ImplementationDraft.find({ featureId });
    }
  },
  Mutation: {
    createProject: async (_, { title, description }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const project = new Project({ title, description, owner: user.id });
      await project.save();
      return project;
    },
    addFeatureRequest: async (_, { projectId, title, description }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const fr = new FeatureRequest({ projectId, title, description });
      await fr.save();
      return fr;
    },
    submitDraft: async (_, { featureId, content, version }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const draft = new ImplementationDraft({ featureId, content, version: version || 1, author: user.id });
      await draft.save();
      return draft;
    }
  }
};

module.exports = resolvers;