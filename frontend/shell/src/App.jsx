import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';   // ← Make sure this line exists

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

    setCurrentUser(json.data?.currentUser || null);
  } catch (err) {
    console.error("Fetch failed with error:", err);
    setCurrentUser(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCurrentUser();
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
    return <div className="p-20 text-center text-xl">Loading DevPilot...</div>;
  }

  const isLoggedIn = !!currentUser;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">DevPilot 2026</h1>
          <div className="flex gap-8 text-lg">
            <Link to="/projects" className="hover:text-blue-600">Projects</Link>
            <Link to="/ai-review" className="hover:text-blue-600">AI Review</Link>
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hello, {currentUser.username}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded">Login</Link>
          )}
        </nav>

        <Routes>
          <Route path="/" element={
            isLoggedIn ? <Navigate to="/projects" /> : <LoginForm onSuccess={fetchCurrentUser} />
          } />
          <Route path="/projects" element={
            isLoggedIn ? (
              <Suspense fallback={<div className="p-20 text-center text-xl">Loading Projects App...</div>}>
                <ProjectsApp />
              </Suspense>
            ) : <Navigate to="/" />
          } />
          <Route path="/ai-review" element={
            isLoggedIn ? (
              <Suspense fallback={<div className="p-20 text-center text-xl">Loading AI Review...</div>}>
                <AIReviewApp />
              </Suspense>
            ) : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  );
}