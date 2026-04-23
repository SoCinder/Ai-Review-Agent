import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import FeatureItem from './FeatureItem';

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) { id title description }
  }
`;

const GET_FEATURE_REQUESTS = gql`
  query GetFeatureRequests($projectId: ID!) {
    featureRequests(projectId: $projectId) {
      id title description status createdAt
    }
  }
`;

const ADD_FEATURE_REQUEST = gql`
  mutation AddFeatureRequest($projectId: ID!, $title: String!, $description: String!) {
    addFeatureRequest(projectId: $projectId, title: $title, description: $description) {
      id title
    }
  }
`;

export default function ProjectDetail({ projectId, onBack }) {
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT, { variables: { id: projectId } });
  const { data: featuresData, loading: featuresLoading } = useQuery(GET_FEATURE_REQUESTS, { variables: { projectId } });
  const [addFeature, { loading: adding }] = useMutation(ADD_FEATURE_REQUEST, {
    refetchQueries: [{ query: GET_FEATURE_REQUESTS, variables: { projectId } }],
  });

  const handleAddFeature = async () => {
    if (!featureTitle.trim()) return;
    await addFeature({ variables: { projectId, title: featureTitle, description: featureDesc } });
    setFeatureTitle('');
    setFeatureDesc('');
    setShowForm(false);
  };

  const project = projectData?.project;
  const features = featuresData?.featureRequests || [];

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← Back to Projects
        </button>

        {/* Project header */}
        {projectLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 h-28 animate-pulse mb-6" />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="px-6 py-5">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{project?.title}</h1>
              <p className="text-slate-500 text-sm">{project?.description || 'No description'}</p>
            </div>
          </div>
        )}

        {/* Feature requests section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Feature Requests</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {features.length > 0 ? `${features.length} feature${features.length !== 1 ? 's' : ''}` : 'None yet'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            style={{ backgroundColor: '#2563eb' }}
            className="text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <span className="font-bold text-base leading-none">+</span> Add Feature
          </button>
        </div>

        {/* Add feature form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-sm">New Feature Request</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-400">*</span></label>
                <input
                  placeholder="What feature should be added?"
                  value={featureTitle}
                  onChange={e => setFeatureTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFeature()}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  placeholder="Provide details about this feature..."
                  value={featureDesc}
                  onChange={e => setFeatureDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 resize-none text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={adding || !featureTitle.trim()}
                  style={{ backgroundColor: adding || !featureTitle.trim() ? '#93c5fd' : '#2563eb' }}
                  className="text-white px-5 py-2 rounded-lg font-medium text-sm"
                >
                  {adding ? 'Adding...' : 'Add Feature'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFeatureTitle(''); setFeatureDesc(''); }}
                  className="px-5 py-2 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature list */}
        {featuresLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-20 animate-pulse" />
            ))}
          </div>
        ) : features.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="text-4xl mb-3">🧩</div>
            <p className="text-slate-700 font-semibold mb-1">No feature requests yet</p>
            <p className="text-slate-400 text-sm mb-4">Add your first feature request to start tracking implementation drafts</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: '#2563eb' }}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Add Feature Request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {features.map(f => (
              <FeatureItem key={f.id} feature={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
