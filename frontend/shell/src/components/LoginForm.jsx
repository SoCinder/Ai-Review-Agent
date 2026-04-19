import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
    }
  }
`;

export default function LoginForm({ onSuccess, redirectTo }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [register, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async () => {
    setError('');
    try {
      if (isLogin) {
        const { data } = await login({ variables: { username, password } });
        if (!data?.login) throw new Error('Login failed');
      } else {
        const { data } = await register({ variables: { username, email, password } });
        if (!data?.register) throw new Error('Registration failed');
      }

      if (typeof onSuccess === 'function') await onSuccess();
      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      const gqlMessage = Array.isArray(err?.graphQLErrors)
        ? err.graphQLErrors.map((e) => e.message).join('; ')
        : '';
      const networkMessage = Array.isArray(err?.networkError?.result?.errors)
        ? err.networkError.result.errors.map((e) => e.message).join('; ')
        : (err?.networkError?.message || '');
      const message = gqlMessage || networkMessage || err?.message || 'Operation failed';
      setError(message);
    }
  };

  const loading = loginLoading || registerLoading;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join DevPilot'}
            </h2>
            <p className="text-blue-100 text-sm">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <p className="text-red-800 font-medium text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-100 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>

            {/* Toggle */}
            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-3">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
              >
                {isLogin ? 'Create one now' : 'Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}