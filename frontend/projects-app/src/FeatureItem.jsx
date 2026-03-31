import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_DRAFTS = gql`
  query GetDrafts($featureId: ID!) {
    draftsByFeature(featureId: $featureId) {
      id
      content
      version
      createdAt
    }
  }
`;

const SUBMIT_DRAFT = gql`
  mutation SubmitDraft($featureId: ID!, $content: String!, $version: Int) {
    submitDraft(featureId: $featureId, content: $content, version: $version) {
      id
      content
      version
      createdAt
    }
  }
`;

export default function FeatureItem({ feature }) {
  const [expanded, setExpanded] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [draftVersion, setDraftVersion] = useState('');

  const { data, loading } = useQuery(GET_DRAFTS, {
    variables: { featureId: feature.id },
    skip: !expanded
  });

  const [submitDraft] = useMutation(SUBMIT_DRAFT, {
    refetchQueries: [{ query: GET_DRAFTS, variables: { featureId: feature.id } }]
  });

  const handleSubmitDraft = async () => {
    if (!draftContent.trim()) return;
    await submitDraft({
      variables: {
        featureId: feature.id,
        content: draftContent,
        version: draftVersion ? parseInt(draftVersion, 10) : undefined
      }
    });
    setDraftContent('');
    setDraftVersion('');
  };

  const inputStyle = {
    border: '1px solid #d1d5db', padding: '10px', width: '100%',
    borderRadius: '8px', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box'
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontWeight: '600', fontSize: '17px', color: '#111', margin: 0 }}>{feature.title}</h4>
          <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>{feature.description}</p>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: '500', padding: '4px 10px',
          borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', whiteSpace: 'nowrap'
        }}>
          {feature.status || 'open'}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{ marginTop: '16px', fontSize: '14px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {expanded ? '▾ Hide Drafts' : '▸ Show Drafts'}
      </button>

      {expanded && (
        <div style={{ marginTop: '16px' }}>
          <div>
            <h5 style={{ fontWeight: '500', color: '#333', marginBottom: '8px', fontSize: '15px' }}>Draft History</h5>
            {loading ? (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading drafts...</p>
            ) : data?.draftsByFeature?.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>No drafts yet. Submit one below!</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data?.draftsByFeature?.map(draft => (
                  <li key={draft.id} style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', color: '#374151' }}>v{draft.version}</span>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {new Date(Number(draft.createdAt)).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: '#4b5563', whiteSpace: 'pre-wrap', margin: 0 }}>{draft.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
            <h5 style={{ fontWeight: '500', color: '#333', marginBottom: '8px', fontSize: '15px' }}>Submit Draft</h5>
            <textarea
              placeholder="Draft content — describe your implementation details or notes"
              value={draftContent}
              onChange={e => setDraftContent(e.target.value)}
              style={{ ...inputStyle, height: '80px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                placeholder="Version (optional)"
                value={draftVersion}
                onChange={e => setDraftVersion(e.target.value)}
                style={{ ...inputStyle, width: '160px', marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={handleSubmitDraft}
                style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Submit Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
