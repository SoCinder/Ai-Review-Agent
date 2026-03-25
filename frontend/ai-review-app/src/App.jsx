export default function App() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <h1 className="text-5xl font-bold text-purple-600 mb-8">AI Review (Coming Soon)</h1>
      <div className="bg-white p-12 rounded-2xl shadow-xl">
        <p className="text-2xl mb-8">Agentic RAG + AI Code Review placeholder</p>
        <button 
          onClick={() => alert('AI Review workflow will be implemented in Weeks 11-12!')}
          className="bg-purple-600 text-white text-xl px-12 py-6 rounded-2xl hover:bg-purple-700"
        >
          Request AI Review
        </button>
      </div>
    </div>
  );
}