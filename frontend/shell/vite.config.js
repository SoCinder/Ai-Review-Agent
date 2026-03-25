import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        projects: 'http://localhost:3001/assets/remoteEntry.js',
        aiReview: 'http://localhost:3002/assets/remoteEntry.js'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        // Do NOT share @apollo/client — this fixes the export error
        graphql: { singleton: true },
        rxjs: { singleton: true }
      }
    })
  ],
  server: { port: 3000 }
})