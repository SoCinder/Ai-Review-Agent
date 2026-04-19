import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import LoginForm from './components/LoginForm';

const ProjectsApp = lazy(() => import('projects/App'));
const AIReviewApp = lazy(() => import('aiReview/App'));

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{ currentUser { id username role } }`
        })
      });

      const json = await res.json();
      console.log('👤 fetchCurrentUser response:', json); // ← add this
      setCurrentUser(json.data?.currentUser || null);
    } catch (err) {
      console.error("Fetch failed with error:", err);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchCurrentUser().finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'mutation { logout }' })
    });
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading DevPilot...</p>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!currentUser;

  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
          <nav className="bg-white shadow-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">DevPilot 2026</h1>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex gap-6 text-sm font-medium">
                  <Link to="/projects" className="text-slate-600 hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">Projects</Link>
                  <Link to="/ai-review" className="text-slate-600 hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">AI Review</Link>
                </div>
                {isLoggedIn ? (
                  <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-slate-900">Welcome</span>
                      <span className="text-xs text-slate-500">{currentUser.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">Login</Link>
                )}
              </div>
            </div>
          </nav>

          <div className="min-h-screen max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={
                isLoggedIn
                  ? <Navigate to="/projects" />
                  : <LoginForm onSuccess={fetchCurrentUser} redirectTo="/projects" />
              } />
              <Route path="/projects" element={
                isLoggedIn ? (
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading Projects...</p>
                      </div>
                    </div>
                  }>
                    <ProjectsApp />
                  </Suspense>
                ) : <Navigate to="/" />
              } />
              <Route path="/ai-review" element={
                isLoggedIn ? (
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading AI Review...</p>
                      </div>
                    </div>
                  }>
                    <AIReviewApp />
                  </Suspense>
                ) : <Navigate to="/" />
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </ApolloProvider>
  );
}