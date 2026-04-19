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

  const getStatusColor = (status) => {
    switch ((status || 'open').toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'planned':
        return 'bg-purple-100 text-purple-700 border border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h4>
            <p className="text-slate-600 text-sm">{feature.description}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(feature.status)}`}>
            {(feature.status || 'open').charAt(0).toUpperCase() + (feature.status || 'open').slice(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition-colors py-2">
          {expanded ? '▼' : '▶'} {expanded ? 'Hide Drafts' : 'Show Drafts'}
        </button>

        {expanded && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
            <div>
              <h5 className="font-semibold text-slate-900 mb-4">Draft History</h5>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-slate-100 rounded h-12 animate-pulse"></div>
                  ))}
                </div>
              ) : data?.draftsByFeature?.length === 0 ? (
                <p className="text-slate-500 text-sm">No drafts submitted yet</p>
              ) : (
                <ul className="space-y-3">
                  {data?.draftsByFeature?.map(draft => (
                    <li key={draft.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-900 text-sm">Version {draft.version}</span>
                        <span className="text-slate-500 text-xs">
                          {new Date(Number(draft.createdAt)).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap line-clamp-3">{draft.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h5 className="font-semibold text-slate-900 mb-4">Submit Draft</h5>
              <div className="space-y-4">
                <textarea
                  placeholder="Describe your implementation details..."
                  value={draftContent}
                  onChange={e => setDraftContent(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                  rows={3}
                />
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 mb-2">Version (Optional)</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={draftVersion}
                      onChange={e => setDraftVersion(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitDraft}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                  >
                    Submit Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
