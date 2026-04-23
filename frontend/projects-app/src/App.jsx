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

  const projects = data?.projectsByUser || [];

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {projects.length > 0 ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : 'No projects yet'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ backgroundColor: '#2563eb' }}
            className="hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium text-sm transition-opacity flex items-center gap-2 shadow-sm"
          >
            <span className="text-base leading-none font-bold">+</span>
            New Project
          </button>
        </div>

        {/* Error */}
        {(queryError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {queryError?.message || error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">New Project</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Title <span className="text-red-400">*</span></label>
                <input
                  placeholder="e.g. User Auth Refactor"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  placeholder="What is this project about?"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 resize-none text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreate}
                  disabled={creating || !title.trim()}
                  style={{ backgroundColor: creating || !title.trim() ? '#93c5fd' : '#2563eb' }}
                  className="text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setTitle(''); setDesc(''); }}
                  className="px-5 py-2 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-44 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-slate-800 font-semibold text-lg mb-1">No projects yet</p>
            <p className="text-slate-400 text-sm mb-5">Create your first project to start tracking features and drafts</p>
            <button
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: '#2563eb' }}
              className="text-white px-5 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group flex flex-col"
              >
                {/* Colour bar */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 flex-1 leading-relaxed">
                    {p.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {p.createdAt ? new Date(Number(p.createdAt)).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                      Open Feature Requests
                      <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
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
