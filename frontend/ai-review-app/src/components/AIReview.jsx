import { useMemo, useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { client } from '../services/api';

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
    case 'critical':
      return 'bg-red-600 text-white';
    case 'high':
      return 'bg-red-100 text-red-700 border border-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
}

export default function AIReview() {
  const [draftText, setDraftText] = useState(sampleDraft);
  const [draftId, setDraftId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [reviewDraft, { loading }] = useMutation(REVIEW_DRAFT, { client });

  const issues = useMemo(() => toArray(result?.issues), [result]);
  const suggestions = useMemo(() => toArray(result?.suggestions), [result]);
  const citations = useMemo(() => toArray(result?.citations), [result]);
  const reflectionNotes = useMemo(
    () => toArray(result?.reflectionNotes),
    [result]
  );
  const retrievedChunks = useMemo(
    () => toArray(result?.retrievedChunks),
    [result]
  );

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
        variables: {
          draftText: trimmed,
          draftId: draftId.trim() || null,
        },
      });
      setResult(response.data.reviewDraft);
    } catch (err) {
      setError(err?.message || 'Failed to run review.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-purple-600 mb-8">AI Code Review</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Submit draft for review</h2>
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-1" htmlFor="draftId">
              Draft ID (optional)
            </label>
            <input
              id="draftId"
              value={draftId}
              onChange={(e) => setDraftId(e.target.value)}
              placeholder="e.g. PR-42"
              className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <label className="block text-sm font-medium mb-1" htmlFor="draftText">
              Draft code
            </label>
            <textarea
              id="draftText"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={16}
              placeholder="Paste code to review..."
              className="w-full p-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {error && (
              <div className="mt-3 text-red-600 font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !draftText.trim()}
              className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Reviewing...' : 'Run AI Review'}
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Grounded review result</h2>
          {!error && !result && !loading && (
            <p className="text-gray-500">
              Submit a draft to see the summary, issues, suggestions,
              citations, reflection notes, and retrieved evidence.
            </p>
          )}
          {loading && <p className="text-gray-500">Running agentic review...</p>}

          {result && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 border border-purple-300">
                  Initial: {result.initialConfidence}%
                </span>
                <span className="px-2 py-1 text-xs rounded bg-purple-600 text-white">
                  Final: {result.finalConfidence}%
                </span>
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 border">
                  Sources used: {citations.length}
                </span>
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 border">
                  Retrieved chunks: {retrievedChunks.length}
                </span>
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 border">
                  Evidence: {result.evidenceStatus || 'n/a'}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-1">Summary</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {result.summary}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-2">Issues</h3>
                {issues.length === 0 ? (
                  <p className="text-gray-500">No issues reported.</p>
                ) : (
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 border-b">Severity</th>
                        <th className="text-left p-2 border-b">Type</th>
                        <th className="text-left p-2 border-b">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map((issue, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 align-top">
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${severityClass(issue.severity)}`}
                            >
                              {issue.severity || 'unknown'}
                            </span>
                          </td>
                          <td className="p-2 align-top">{issue.type}</td>
                          <td className="p-2 align-top">{issue.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-1">
                  Suggestions
                </h3>
                {suggestions.length === 0 ? (
                  <p className="text-gray-500">No suggestions returned.</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-1">Citations</h3>
                {citations.length === 0 ? (
                  <p className="text-gray-500">No citations returned.</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {citations.map((c, i) => (
                      <li key={`${c}-${i}`}>
                        <code className="text-xs bg-gray-100 px-1 rounded">
                          {c}
                        </code>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-1">
                  Reflection notes
                </h3>
                {reflectionNotes.length === 0 ? (
                  <p className="text-gray-500">
                    No reflection notes were returned.
                  </p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {reflectionNotes.map((note, i) => (
                      <li key={`${note}-${i}`}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-purple-600 mb-1">
                  Retrieved evidence
                </h3>
                {retrievedChunks.length === 0 ? (
                  <p className="text-gray-500">
                    No retrieved evidence was returned.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {retrievedChunks.map((doc, i) => (
                      <div
                        key={doc?.sourceId || `chunk-${i}`}
                        className="p-3 rounded border bg-gray-50"
                      >
                        <p className="text-sm font-medium">
                          <code className="text-xs bg-white px-1 rounded border">
                            {doc?.sourceId || 'Unknown ID'}
                          </code>{' '}
                          — {doc?.title || doc?.source || 'Untitled source'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                          {doc?.content || 'No content.'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
