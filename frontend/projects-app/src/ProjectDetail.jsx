import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import FeatureItem from './FeatureItem';

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      title
      description
    }
  }
`;

const GET_FEATURE_REQUESTS = gql`
  query GetFeatureRequests($projectId: ID!) {
    featureRequests(projectId: $projectId) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

const ADD_FEATURE_REQUEST = gql`
  mutation AddFeatureRequest($projectId: ID!, $title: String!, $description: String!) {
    addFeatureRequest(projectId: $projectId, title: $title, description: $description) {
      id
      title
    }
  }
`;

export default function ProjectDetail({ projectId, onBack }) {
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');

  const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT, {
    variables: { id: projectId }
  });

  const { data: featuresData, loading: featuresLoading } = useQuery(GET_FEATURE_REQUESTS, {
    variables: { projectId }
  });

  const [addFeature] = useMutation(ADD_FEATURE_REQUEST, {
    refetchQueries: [{ query: GET_FEATURE_REQUESTS, variables: { projectId } }]
  });

  const handleAddFeature = async () => {
    if (!featureTitle.trim()) return;
    await addFeature({ variables: { projectId, title: featureTitle, description: featureDesc } });
    setFeatureTitle('');
    setFeatureDesc('');
  };

  const inputStyle = {
    border: '1px solid #d1d5db', padding: '12px', width: '100%',
    borderRadius: '8px', fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box'
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition-colors"
      >
        ← Back to Projects
      </button>

      {projectLoading ? (
        <div className="bg-slate-100 animate-pulse rounded-lg h-32"></div>
      ) : (
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{projectData?.project?.title}</h1>
          <p className="text-slate-600 text-lg">{projectData?.project?.description}</p>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Feature Requests</h2>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Add Feature Request</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                placeholder="What feature should be added?"
                value={featureTitle}
                onChange={e => setFeatureTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                placeholder="Provide details about this feature..."
                value={featureDesc}
                onChange={e => setFeatureDesc(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                rows={4}
              />
            </div>
            <button
              type="button"
              onClick={handleAddFeature}
              className="inline-flex w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 items-center justify-center"
            >
              Add Feature Request
            </button>
          </div>
        </div>

        {featuresLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-200 rounded-lg h-24 animate-pulse"></div>
            ))}
          </div>
        ) : featuresData?.featureRequests?.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-500 text-lg font-medium">No feature requests yet</p>
            <p className="text-slate-400 mt-1">Create your first feature request above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {featuresData?.featureRequests?.map(f => (
              <FeatureItem key={f.id} feature={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
