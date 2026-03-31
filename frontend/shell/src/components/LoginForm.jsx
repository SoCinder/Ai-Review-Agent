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
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        {isLogin ? 'Login to DevPilot' : 'Create Account'}
      </h2>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <div className="space-y-5">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="text-blue-600 mt-6 block mx-auto hover:underline"
      >
        {isLogin
          ? "Don't have an account? Register"
          : 'Already have an account? Login'}
      </button>
    </div>
  );
}