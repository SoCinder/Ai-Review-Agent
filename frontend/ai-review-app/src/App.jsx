import AIReview from './components/AIReview';

export default function App() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-purple-600 mb-8">AI Code Review System</h1>
      <p className="text-xl text-gray-600 mb-8">Agentic RAG + AI-powered code review</p>
      <AIReview />
    </div>
  );
}
