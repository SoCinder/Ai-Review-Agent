import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const PROJECTS = gql`query { projectsByUser { id title description } }`;
const CREATE_PROJECT = gql`mutation CreateProject($title: String!, $description: String!) { createProject(title: $title, description: $description) { id title } }`;

export default function App() {
  const { data, loading } = useQuery(PROJECTS);
  const [create] = useMutation(CREATE_PROJECT, { refetchQueries: [{ query: PROJECTS }] });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    await create({ variables: { title, description: desc } });
    setTitle(''); setDesc('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Projects</h1>
      
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-2xl mb-4">Create New Project</h2>
        <input placeholder="Project Title" value={title} onChange={e=>setTitle(e.target.value)} className="border p-3 w-full mb-4" />
        <textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} className="border p-3 w-full h-24 mb-4" />
        <button onClick={handleCreate} className="bg-green-600 text-white px-8 py-3 rounded">Create Project</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-3 gap-6">
          {data?.projectsByUser.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold text-xl">{p.title}</h3>
              <p className="text-gray-600 mt-2">{p.description}</p>
              {/* You can expand with feature requests and drafts here – full functionality is ready in backend */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}