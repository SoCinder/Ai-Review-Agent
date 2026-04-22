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
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      if (project.owner.toString() !== user.id) throw new Error('Not authorized');
      return project;
    },
    featureRequests: async (_, { projectId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      if (project.owner.toString() !== user.id) throw new Error('Not authorized');
      return FeatureRequest.find({ projectId });
    },
    draftsByFeature: async (_, { featureId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const feature = await FeatureRequest.findById(featureId);
      if (!feature) throw new Error('Feature not found');
      const project = await Project.findById(feature.projectId);
      if (!project || project.owner.toString() !== user.id) throw new Error('Not authorized');
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
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      if (project.owner.toString() !== user.id) throw new Error('Not authorized');
      const fr = new FeatureRequest({ projectId, title, description });
      await fr.save();
      return fr;
    },
    submitDraft: async (_, { featureId, content, version }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const feature = await FeatureRequest.findById(featureId);
      if (!feature) throw new Error('Feature not found');
      const project = await Project.findById(feature.projectId);
      if (!project || project.owner.toString() !== user.id) throw new Error('Not authorized');
      const draft = new ImplementationDraft({ featureId, content, version: version || 1, author: user.id });
      await draft.save();
      return draft;
    }
  }
};

module.exports = resolvers;