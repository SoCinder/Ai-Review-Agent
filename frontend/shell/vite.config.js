import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'shell',
      remotes: {
        projects: {
          type: 'module',
          name: 'projects',
          entry: 'http://localhost:3001/remoteEntry.js',
        },
        aiReview: {
          type: 'module',
          name: 'aiReview',
          entry: 'http://localhost:3002/remoteEntry.js',
        }
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        'react-router-dom': { singleton: true, eager: true },
        '@apollo/client': { singleton: true, eager: true },
        rxjs: { singleton: true, eager: true }
      }
    })
  ],
  build: { target: 'esnext' },
  server: { port: 3000 },
  preview: { port: 3000 }
})