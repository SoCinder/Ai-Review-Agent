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

const statusColors = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  planned: 'bg-purple-100 text-purple-700 border-purple-200',
  open: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function FeatureItem({ feature }) {
  const [expanded, setExpanded] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [draftVersion, setDraftVersion] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const { data, loading } = useQuery(GET_DRAFTS, {
    variables: { featureId: feature.id },
    skip: !expanded,
  });

  const [submitDraft, { loading: submitting }] = useMutation(SUBMIT_DRAFT, {
    refetchQueries: [{ query: GET_DRAFTS, variables: { featureId: feature.id } }],
  });

  const handleSubmitDraft = async () => {
    if (!draftContent.trim()) return;
    await submitDraft({
      variables: {
        featureId: feature.id,
        content: draftContent,
        version: draftVersion ? parseInt(draftVersion, 10) : undefined,
      },
    });
    setDraftContent('');
    setDraftVersion('');
    setShowSubmitForm(false);
  };

  const status = (feature.status || 'open').toLowerCase();
  const statusClass = statusColors[status] || statusColors.open;
  const drafts = data?.draftsByFeature || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
      {/* Feature header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 text-base truncate">{feature.title}</h4>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${statusClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <p className="text-slate-500 text-sm line-clamp-2">{feature.description}</p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <span className={`transition-transform duration-200 inline-block ${expanded ? 'rotate-90' : ''}`}>▶</span>
            {expanded ? 'Hide Drafts' : `Show Drafts${drafts.length ? ` (${drafts.length})` : ''}`}
          </button>
          <span className="text-slate-200">|</span>
          <button
            type="button"
            onClick={() => { setShowSubmitForm(!showSubmitForm); setExpanded(true); }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            + Submit Draft
          </button>
          <a
            href="/ai-review"
            className="ml-auto text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            AI Review →
          </a>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50">

          {/* Submit draft form */}
          {showSubmitForm && (
            <div className="p-5 border-b border-slate-200 bg-white">
              <h5 className="font-semibold text-slate-800 text-sm mb-3">New Draft</h5>
              <textarea
                placeholder="Describe your implementation..."
                value={draftContent}
                onChange={e => setDraftContent(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 resize-none text-sm"
                rows={4}
              />
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="number"
                  placeholder="Version (optional)"
                  value={draftVersion}
                  onChange={e => setDraftVersion(e.target.value)}
                  className="w-36 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm"
                />
                <button
                  type="button"
                  onClick={handleSubmitDraft}
                  disabled={submitting || !draftContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="text-slate-500 hover:text-slate-700 text-sm px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Draft list */}
          <div className="p-5">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="bg-slate-200 rounded-lg h-16 animate-pulse" />)}
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No drafts yet</p>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Submit the first draft →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  {drafts.length} Draft{drafts.length !== 1 ? 's' : ''}
                </p>
                {drafts.map(draft => (
                  <div key={draft.id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                          v{draft.version}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(Number(draft.createdAt)).toLocaleDateString('en-CA', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                      </div>
                      <a
                        href="/ai-review"
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Review →
                      </a>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap line-clamp-3 font-mono bg-slate-50 rounded p-2 border border-slate-100">
                      {draft.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
