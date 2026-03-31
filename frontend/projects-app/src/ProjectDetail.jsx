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
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ marginBottom: '24px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
      >
        ← Back to Projects
      </button>

      {projectLoading ? (
        <p style={{ color: '#6b7280' }}>Loading project...</p>
      ) : (
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>{projectData?.project?.title}</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>{projectData?.project?.description}</p>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Feature Requests</h2>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '500', marginBottom: '16px', color: '#333' }}>Add Feature Request</h3>
          <input
            placeholder="Feature title"
            value={featureTitle}
            onChange={e => setFeatureTitle(e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Description"
            value={featureDesc}
            onChange={e => setFeatureDesc(e.target.value)}
            style={{ ...inputStyle, height: '80px' }}
          />
          <button
            type="button"
            onClick={handleAddFeature}
            style={{ background: '#16a34a', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            Add Feature
          </button>
        </div>

        {featuresLoading ? (
          <p style={{ color: '#6b7280' }}>Loading features...</p>
        ) : featuresData?.featureRequests?.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No feature requests yet. Add one above!</p>
        ) : (
          <div>
            {featuresData?.featureRequests?.map(f => (
              <FeatureItem key={f.id} feature={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
