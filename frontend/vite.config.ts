import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import yaml from '@rollup/plugin-yaml';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    yaml()
  ],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    proxy: {
      '/dmesh': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
