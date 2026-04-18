import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'aiReview',
      filename: 'remoteEntry.js',
      dynamicRemoteTypeHints: false,
      dts: false,
      dynamicTypeHints: false,
      exposes: { './App': './src/App.jsx' },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        'react-router-dom': { singleton: true, eager: true },
        '@apollo/client': { singleton: true, eager: true },
      }
    })
  ],
  build: { target: 'esnext' },
  server: { port: 3002 },
  preview: { port: 3002 }
})