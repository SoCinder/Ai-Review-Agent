import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import ProjectDetail from './ProjectDetail';

const PROJECTS = gql`query { projectsByUser { id title description createdAt } }`;
const CREATE_PROJECT = gql`mutation CreateProject($title: String!, $description: String!) { createProject(title: $title, description: $description) { id title } }`;

export default function App() {
  const { data, loading, error: queryError } = useQuery(PROJECTS);
  const [create, { loading: creating }] = useMutation(CREATE_PROJECT, { refetchQueries: [{ query: PROJECTS }] });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setError('');
    try {
      await create({ variables: { title, description: desc } });
      setTitle('');
      setDesc('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    }
  };

  if (selectedProjectId) {
    return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
  }

  return (
    <div className="w-full min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-slate-50">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage your development projects and feature requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> New Project
          </button>
        </div>

        {/* Errors */}
        {(queryError || error) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-800 font-medium text-sm">{queryError?.message || error}</p>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Create New Project</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Title</label>
                <input
                  placeholder="e.g. User Auth Refactor"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  placeholder="What is this project about?"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 resize-none text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={creating || !title.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-44 animate-pulse" />
            ))}
          </div>
        ) : !data?.projectsByUser?.length ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-slate-700 font-semibold text-lg">No projects yet</p>
            <p className="text-slate-400 mt-1 text-sm">Click "New Project" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.projectsByUser.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group flex flex-col"
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 text-base">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                    {p.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {p.createdAt ? new Date(Number(p.createdAt)).toLocaleDateString() : ''}
                    </span>
                    <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Open <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
