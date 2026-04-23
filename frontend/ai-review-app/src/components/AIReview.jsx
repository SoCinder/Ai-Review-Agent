import { useMemo, useState } from 'react';
import { useMutation, useQuery, useApolloClient, gql } from '@apollo/client';
import { client as fallbackClient } from '../services/api';

const GET_PROJECTS = gql`
  query GetProjects {
    projectsByUser {
      id
      title
    }
  }
`;

const GET_FEATURES = gql`
  query GetFeatures($projectId: ID!) {
    featureRequests(projectId: $projectId) {
      id
      title
    }
  }
`;

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

const REVIEW_DRAFT = gql`
  mutation ReviewDraft($draftText: String!, $draftId: ID) {
    reviewDraft(draftText: $draftText, draftId: $draftId) {
      id
      draftId
      summary
      issues {
        type
        severity
        description
      }
      suggestions
      citations
      retrievedChunks {
        sourceId
        source
        title
        content
      }
      initialConfidence
      finalConfidence
      reflectionNotes
      evidenceStatus
      status
      createdAt
    }
  }
`;

const sampleDraft = `function getUser(id) {
  const user = db.query("SELECT * FROM users WHERE id = " + id);
  return user;
}`;

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function severityClass(severity) {
  switch ((severity || '').toLowerCase()) {
    case 'critical': return 'bg-red-600 text-white';
    case 'high': return 'bg-red-100 text-red-700 border border-red-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'low': return 'bg-blue-100 text-blue-700 border border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
}

export default function AIReview() {
  const [draftText, setDraftText] = useState(sampleDraft);
  const [draftId, setDraftId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Project workflow selectors
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFeatureId, setSelectedFeatureId] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [mode, setMode] = useState('paste'); // 'paste' | 'workflow'

  const contextClient = useApolloClient();
  const activeClient = contextClient || fallbackClient;

  const { data: projectsData } = useQuery(GET_PROJECTS, {
    client: activeClient,
    skip: mode !== 'workflow',
  });

  const { data: featuresData } = useQuery(GET_FEATURES, {
    client: activeClient,
    variables: { projectId: selectedProjectId },
    skip: mode !== 'workflow' || !selectedProjectId,
  });

  const { data: draftsData } = useQuery(GET_DRAFTS, {
    client: activeClient,
    variables: { featureId: selectedFeatureId },
    skip: mode !== 'workflow' || !selectedFeatureId,
  });

  const [reviewDraft, { loading }] = useMutation(REVIEW_DRAFT, { client: activeClient });

  const issues = useMemo(() => toArray(result?.issues), [result]);
  const suggestions = useMemo(() => toArray(result?.suggestions), [result]);
  const citations = useMemo(() => toArray(result?.citations), [result]);
  const reflectionNotes = useMemo(() => toArray(result?.reflectionNotes), [result]);
  const retrievedChunks = useMemo(() => toArray(result?.retrievedChunks), [result]);

  // Map citation sourceId → full chunk details for richer display
  const citationDetails = useMemo(() => {
    return citations.map(id => {
      const chunk = retrievedChunks.find(c => c.sourceId === id);
      return { id, title: chunk?.title || id, source: chunk?.source || '', content: chunk?.content || '' };
    });
  }, [citations, retrievedChunks]);

  const confidenceDelta = result
    ? result.finalConfidence - result.initialConfidence
    : null;

  const handleDraftSelect = (draftId) => {
    const draft = draftsData?.draftsByFeature?.find(d => d.id === draftId);
    if (draft) {
      setSelectedDraftId(draftId);
      setDraftText(draft.content);
      setDraftId(draftId);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = draftText.trim();
    if (!trimmed) {
      setError('Please paste a code draft to review.');
      return;
    }
    setError('');
    setResult(null);
    try {
      const response = await reviewDraft({
        variables: { draftText: trimmed, draftId: draftId.trim() || null },
      });
      setResult(response.data.reviewDraft);
    } catch (err) {
      setError(err?.message || 'Failed to run review.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
            AI-Powered Code Review
          </h1>
          <p className="text-slate-600 text-lg">Agentic RAG system for grounded code reviews with citations and evidence</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('workflow')}
            style={{ backgroundColor: mode === 'workflow' ? '#7c3aed' : undefined, color: mode === 'workflow' ? 'white' : undefined }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'workflow' ? 'border-purple-600' : 'border-slate-300 text-slate-600 hover:border-purple-400'}`}
          >
            Load from Project Workflow
          </button>
          <button
            type="button"
            onClick={() => setMode('paste')}
            style={{ backgroundColor: mode === 'paste' ? '#7c3aed' : undefined, color: mode === 'paste' ? 'white' : undefined }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'paste' ? 'border-purple-600' : 'border-slate-300 text-slate-600 hover:border-purple-400'}`}
          >
            Paste Code Manually
          </button>
        </div>

        {/* Workflow selector */}
        {mode === 'workflow' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Select a submitted draft from your projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={e => { setSelectedProjectId(e.target.value); setSelectedFeatureId(''); setSelectedDraftId(''); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a project...</option>
                  {projectsData?.projectsByUser?.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Feature</label>
                <select
                  value={selectedFeatureId}
                  onChange={e => { setSelectedFeatureId(e.target.value); setSelectedDraftId(''); }}
                  disabled={!selectedProjectId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <option value="">Select a feature...</option>
                  {featuresData?.featureRequests?.map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Draft</label>
                <select
                  value={selectedDraftId}
                  onChange={e => handleDraftSelect(e.target.value)}
                  disabled={!selectedFeatureId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <option value="">Select a draft...</option>
                  {draftsData?.draftsByFeature?.map(d => (
                    <option key={d.id} value={d.id}>
                      v{d.version} — {new Date(Number(d.createdAt)).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedDraftId && (
              <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                Draft loaded — ready to review below.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: submit form */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Submit Code for Review</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              <div className="space-y-6">
                {mode === 'paste' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="draftId">
                      Draft ID <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="draftId"
                      value={draftId}
                      onChange={(e) => setDraftId(e.target.value)}
                      placeholder="e.g., PR-42"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="draftText">Code to Review</label>
                  <textarea
                    id="draftText"
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={12}
                    placeholder="Paste your code here..."
                    className="w-full min-h-[320px] px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder-slate-400 resize-none"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-red-800 font-medium text-sm">{error}</p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading || !draftText.trim()}
                  style={{ backgroundColor: loading || !draftText.trim() ? '#a78bfa' : '#7c3aed', color: 'white' }}
                  className="w-full font-semibold py-4 rounded-2xl transition-colors duration-200 flex items-center justify-center gap-3 text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-100 border-t-white rounded-full animate-spin"></div>
                      Running Review...
                    </>
                  ) : 'Submit for Review'}
                </button>
              </div>
            </form>
          </section>

          {/* Right: results */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Review Results</h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {!error && !result && !loading && (
                <div className="text-center py-8">
                  <p className="text-slate-600 font-medium">Submit code to see results</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-600 font-medium">Running review...</p>
                </div>
              )}
              {result && (
                <div className="space-y-6">
                  {/* Confidence badges */}
                  <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
                    <div className="px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                      Initial: {result.initialConfidence}%
                    </div>
                    <div className="px-3 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white">
                      Final: {result.finalConfidence}%
                    </div>
                    {confidenceDelta !== null && confidenceDelta !== 0 && (
                      <div className={`px-3 py-2 text-xs font-semibold rounded-lg border ${confidenceDelta < 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        Reflection: {confidenceDelta > 0 ? '+' : ''}{confidenceDelta.toFixed(0)}%
                      </div>
                    )}
                    {confidenceDelta === 0 && (
                      <div className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                        Reflection: No change
                      </div>
                    )}
                    <div className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      📚 {citations.length} sources
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-purple-600 text-sm mb-3">Summary</h3>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{result.summary}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-600 text-sm mb-3">Issues ({issues.length})</h3>
                    {issues.length === 0 ? (
                      <p className="text-slate-500 text-sm">✓ No issues found</p>
                    ) : (
                      <div className="space-y-2">
                        {issues.map((issue, i) => (
                          <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                            <div className="flex items-start gap-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${severityClass(issue.severity)}`}>
                                {issue.severity || 'unknown'}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 text-sm">{issue.type}</p>
                                <p className="text-slate-600 text-sm mt-1">{issue.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {suggestions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-purple-600 text-sm mb-3">Suggestions</h3>
                      <ul className="space-y-2">
                        {suggestions.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700">
                            <span className="text-purple-600">→</span><span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {result && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Citations — now with title + source */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-purple-600 text-lg mb-4">Citations ({citationDetails.length})</h3>
              {citationDetails.length === 0 ? (
                <p className="text-slate-500 text-sm">No citations returned.</p>
              ) : (
                <ul className="space-y-3">
                  {citationDetails.map((c, i) => (
                    <li key={`${c.id}-${i}`} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-purple-600 text-sm font-bold mt-0.5">[{i + 1}]</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                          <code className="text-xs text-purple-600 font-mono">{c.id}</code>
                          {c.source && <span className="text-xs text-slate-500 ml-2">— {c.source}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Reflection — with explicit delta explanation */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-purple-600 text-lg mb-1">Reflection Notes</h3>
              {confidenceDelta !== null && (
                <p className="text-xs text-slate-500 mb-4">
                  Confidence changed from <strong>{result.initialConfidence}%</strong> to <strong>{result.finalConfidence}%</strong>
                  {confidenceDelta === 0
                    ? ' — reflection confirmed the initial review.'
                    : confidenceDelta < 0
                    ? ` (reduced by ${Math.abs(confidenceDelta).toFixed(0)}% due to evidence issues).`
                    : ` (increased by ${confidenceDelta.toFixed(0)}%).`}
                </p>
              )}
              {reflectionNotes.length === 0 ? (
                <p className="text-slate-500 text-sm">No reflection notes.</p>
              ) : (
                <ul className="space-y-2">
                  {reflectionNotes.map((note, i) => (
                    <li key={`${note}-${i}`} className="flex gap-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <span className="text-purple-600">💭</span><span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {result && retrievedChunks.length > 0 && (
          <section className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-purple-600 text-lg mb-4">Retrieved Evidence ({retrievedChunks.length})</h3>
            <div className="space-y-3">
              {retrievedChunks.map((doc, i) => (
                <div key={doc?.sourceId || `chunk-${i}`} className="border border-slate-200 rounded-lg p-4 bg-slate-50 hover:bg-slate-100">
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    <code className="text-xs bg-white px-2 py-1 rounded border border-slate-300 font-mono text-purple-600">{doc?.sourceId || 'Unknown'}</code>
                    <span className="ml-2 font-semibold">{doc?.title}</span>
                    {doc?.source && <span className="text-slate-500 font-normal ml-1">({doc.source})</span>}
                  </p>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap font-mono">{doc?.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
