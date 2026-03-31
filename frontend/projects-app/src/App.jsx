import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import ProjectDetail from './ProjectDetail';

const PROJECTS = gql`query { projectsByUser { id title description } }`;
const CREATE_PROJECT = gql`mutation CreateProject($title: String!, $description: String!) { createProject(title: $title, description: $description) { id title } }`;

export default function App() {
  const { data, loading, error: queryError } = useQuery(PROJECTS);
  const [create] = useMutation(CREATE_PROJECT, { refetchQueries: [{ query: PROJECTS }] });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    setError('');
    try {
      await create({ variables: { title, description: desc } });
      setTitle('');
      setDesc('');
    } catch (err) {
      console.error('Create project error:', err);
      setError(err.message || 'Failed to create project');
    }
  };

  if (selectedProjectId) {
    return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#111' }}>My Projects</h1>

      {queryError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          Query error: {queryError.message}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', marginBottom: '32px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#333' }}>Create New Project</h2>
        <input
          placeholder="Project Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ border: '1px solid #d1d5db', padding: '12px', width: '100%', marginBottom: '12px', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <textarea
          placeholder="Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{ border: '1px solid #d1d5db', padding: '12px', width: '100%', height: '80px', marginBottom: '12px', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <button
          onClick={handleCreate}
          style={{ background: '#16a34a', color: '#fff', padding: '12px 32px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
        >
          Create Project
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {(!data?.projectsByUser || data.projectsByUser.length === 0) && (
            <p style={{ color: '#6b7280' }}>No projects yet. Create one above!</p>
          )}
          {data?.projectsByUser?.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              style={{
                background: '#fff', padding: '24px', borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)', cursor: 'pointer',
                border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)'}
            >
              <h3 style={{ fontWeight: 'bold', fontSize: '18px', color: '#111', marginBottom: '8px' }}>{p.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>{p.description}</p>
              <p style={{ color: '#3b82f6', fontSize: '13px', marginTop: '12px' }}>Click to view details →</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
