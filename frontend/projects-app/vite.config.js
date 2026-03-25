import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'projects',
      filename: 'remoteEntry.js',
      exposes: { './App': './src/App.jsx' },
      shared: ['react', 'react-dom', '@apollo/client']
    })
  ],
  server: { port: 3001 }
})