import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { client } from '../services/api';

const GET_DOCUMENTS = gql`
  query GetDocuments($projectId: ID!) {
    documents(projectId: $projectId) {
      id
      title
      content
      type
      tags
      metadata
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      userId
      projectId
      documentId
      aiOutput
      confidenceScore
      status
      createdAt
      updatedAt
    }
  }
`;

export default function AIReview() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: documentsData, loading: documentsLoading, error: documentsError } = useQuery(
    GET_DOCUMENTS,
    {
      variables: { projectId: 'sample-project' },
      client,
    }
  );

  const [createReview] = useMutation(CREATE_REVIEW, {
    client,
  });

  useEffect(() => {
    // Auto-select first document if available
    if (documentsData?.documents?.length > 0 && !selectedDocument) {
      setSelectedDocument(documentsData.documents[0]);
    }
  }, [documentsData, selectedDocument]);

  const handleRequestReview = async () => {
    if (!selectedDocument || !reviewText.trim()) {
      setError('Please select a document and provide review context');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await createReview({
        variables: {
          input: {
            userId: 'sample-user',
            projectId: 'sample-project',
            documentId: selectedDocument.id,
            aiOutput: {
              review: reviewText,
              suggestions: [],
              confidence: 0.95,
            },
            confidenceScore: 0.95,
          },
        },
      });

      console.log('Review created:', response.data.createReview);
      setReviewText('');
      setError('Review requested successfully! The AI will process your request shortly.');
    } catch (err) {
      console.error(err);
      setError('Failed to create review: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (documentsLoading) return <div className="p-8">Loading documents...</div>;
  if (documentsError) return <div className="p-8 text-red-600">Error loading documents: {documentsError.message}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-purple-600 mb-8">AI Code Review</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Select Document</h2>
            <div className="space-y-2">
              {documentsData?.documents?.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`w-full p-3 text-left rounded-lg cursor-pointer transition-all ${
                    selectedDocument?.id === doc.id
                      ? 'bg-purple-100 text-purple-600 border border-purple-300'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <h3 className="font-medium">{doc.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{doc.type}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review Input */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Provide Review Context</h2>

            {selectedDocument && (
              <div className="mb-4">
                <h3 className="font-medium text-purple-600 mb-2">
                  Selected Document: {selectedDocument.title}
                </h3>
                <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
                  {selectedDocument.content.substring(0, 200)}...
                </div>
              </div>
            )}

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Provide context for the AI review (e.g., what aspects to focus on, specific concerns, etc.)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={6}
            />

            {error && <div className="mt-3 text-red-600 font-medium">{error}</div>}

            <button
              onClick={handleRequestReview}
              disabled={isLoading || !selectedDocument || !reviewText.trim()}
              className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Request AI Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}