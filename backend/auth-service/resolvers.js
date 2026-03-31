const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resolvers = {
  User: {
    __resolveReference: (ref) => User.findById(ref.id)
  },

  Query: {
    currentUser: (_, __, { user }) => user || null
  },

  Mutation: {
    register: async (_, { username, email, password }, { req }) => {
      const existing = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existing) throw new Error('User already exists');

      const user = new User({ username, email, password });
      await user.save();

      return new Promise((resolve, reject) => {
        req.session.user = {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        };

        req.session.save((err) => {
          if (err) return reject(err);
          resolve({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
          });
        });
      });
    },

    login: async (_, { username, password }, { req }) => {
      const user = await User.findOne({ username });

      if (!user) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid credentials');

      return new Promise((resolve, reject) => {
        req.session.user = {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        };

        req.session.save((err) => {
          if (err) return reject(err);

          resolve({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
          });
        });
      });
    },

    logout: (_, __, { req }) => {
      return new Promise((resolve) => {
        req.session.destroy(() => resolve(true));
      });
    }
  }
};

module.exports = resolvers;