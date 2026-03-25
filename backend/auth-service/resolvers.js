const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resolvers = {
  User: {
    __resolveReference: (ref) => User.findById(ref.id)
  },
  Query: {
    currentUser: (_, __, { user }) => user ? { ...user, id: user.id } : null
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const existing = await User.findOne({ $or: [{ username }, { email }] });
      if (existing) throw new Error('User already exists');
      const user = new User({ username, email, password });
      await user.save();
      return { id: user._id.toString(), username: user.username, email: user.email, role: user.role };
    },
    login: async (_, { username, password }, { req }) => {
      const user = await User.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) throw new Error('Invalid credentials');
      req.session.user = { id: user._id.toString(), username: user.username, email: user.email, role: user.role };
      await req.session.save();
      return req.session.user;
    },
    logout: (_, __, { req }) => {
      return new Promise((resolve) => {
        req.session.destroy(() => resolve(true));
      });
    }
  }
};

module.exports = resolvers;