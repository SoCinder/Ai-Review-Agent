import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_DRAFTS = gql`
  query GetDrafts($featureId: ID!) {
    draftsByFeature(featureId: $featureId) {
      id content version createdAt
    }
  }
`;

const SUBMIT_DRAFT = gql`
  mutation SubmitDraft($featureId: ID!, $content: String!, $version: Int) {
    submitDraft(featureId: $featureId, content: $content, version: $version) {
      id content version createdAt
    }
  }
`;

const statusConfig = {
  completed:    { label: 'Completed',   classes: 'bg-green-100 text-green-700 border-green-200' },
  'in-progress':{ label: 'In Progress', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  planned:      { label: 'Planned',     classes: 'bg-purple-100 text-purple-700 border-purple-200' },
  open:         { label: 'Open',        classes: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function FeatureItem({ feature }) {
  const [expanded, setExpanded] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [draftVersion, setDraftVersion] = useState('');

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
  const { label, classes } = statusConfig[status] || statusConfig.open;
  const drafts = data?.draftsByFeature || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">

      {/* Feature row */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-0.5 w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            title={expanded ? 'Collapse' : 'Expand drafts'}
          >
            <span className={`text-xs transition-transform duration-200 inline-block ${expanded ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-slate-900 text-sm">{feature.title}</h4>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${classes}`}>
                {label}
              </span>
            </div>
            {feature.description && (
              <p className="text-slate-500 text-xs mt-1 line-clamp-1">{feature.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => { setShowSubmitForm(!showSubmitForm); if (!expanded) setExpanded(true); }}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              + Draft
            </button>
            <a
              href="/ai-review"
              className="text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              AI Review
            </a>
          </div>
        </div>

        {/* Drafts summary bar when collapsed */}
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-3 ml-9 text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <span>📄</span>
            {loading ? 'Loading...' : `View drafts`}
          </button>
        )}
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-slate-100">

          {/* Submit draft form */}
          {showSubmitForm && (
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-slate-800">New Implementation Draft</h5>
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl w-6 h-6 flex items-center justify-center rounded hover:bg-blue-100 transition-colors"
                >×</button>
              </div>
              <textarea
                placeholder="Describe your implementation approach, code, or design decisions..."
                value={draftContent}
                onChange={e => setDraftContent(e.target.value)}
                className="w-full px-3 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 resize-none text-sm bg-white"
                rows={5}
              />
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="number"
                  placeholder="Version # (optional)"
                  value={draftVersion}
                  onChange={e => setDraftVersion(e.target.value)}
                  className="w-40 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={handleSubmitDraft}
                  disabled={submitting || !draftContent.trim()}
                  style={{ backgroundColor: submitting || !draftContent.trim() ? '#93c5fd' : '#2563eb' }}
                  className="text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="text-slate-500 hover:text-slate-700 text-sm px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Draft list */}
          <div className="px-5 py-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Implementation Drafts
              </p>
              {!showSubmitForm && (
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  + New Draft
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="bg-white rounded-lg h-16 animate-pulse border border-slate-200" />)}
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm mb-2">No drafts submitted yet</p>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(true)}
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                >
                  Submit the first draft →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft, idx) => (
                  <div key={draft.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {/* Draft header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                          v{draft.version}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(Number(draft.createdAt)).toLocaleDateString('en-CA', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                        {idx === 0 && (
                          <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium border border-green-200">
                            Latest
                          </span>
                        )}
                      </div>
                      <a
                        href="/ai-review"
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Review with AI →
                      </a>
                    </div>
                    {/* Draft content */}
                    <div className="px-4 py-3">
                      <p className="text-slate-700 text-xs whitespace-pre-wrap line-clamp-4 font-mono leading-relaxed">
                        {draft.content}
                      </p>
                    </div>
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
