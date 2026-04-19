import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import ProjectDetail from './ProjectDetail';

const PROJECTS = gql`query { projectsByUser { id title description } }`;
const CREATE_PROJECT = gql`mutation CreateProject($title: String!, $description: String!) { createProject(title: $title, description: $description) { id title } }`;

export default function App() {
  const { data, loading, error: queryError } = useQuery(PROJECTS);
  const [create] = useMutation(CREATE_PROJECT, { refetchQueries: [{ query: PROJECTS }] });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    setError('');
    try {
      await create({ variables: { title, description: desc } });
      setTitle('');
      setDesc('');
    } catch (err) {
      console.error('Create project error:', err);
      setError(err.message || 'Failed to create project');
    }
  };

  if (selectedProjectId) {
    return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
  }

  return (
    <div className="w-full min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Projects</h1>
          <p className="text-slate-500">Create and manage your development projects</p>
        </div>

      {queryError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <p className="text-red-800 font-medium text-sm">Query Error</p>
          <p className="text-red-700 text-sm mt-1">{queryError.message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <p className="text-red-800 font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Create New Project</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
            <input
              placeholder="Enter project title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              placeholder="Describe your project..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
              rows={4}
            />
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 items-center justify-center"
          >
            Create Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-200 rounded-lg h-48 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div>
          {(!data?.projectsByUser || data.projectsByUser.length === 0) && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <p className="text-slate-500 text-lg font-medium">No projects yet</p>
              <p className="text-slate-400 mt-1">Create your first project above to get started</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.projectsByUser?.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
              >
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{p.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{p.description || 'No description'}</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>View Details</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
