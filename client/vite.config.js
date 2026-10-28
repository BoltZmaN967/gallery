import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Forward API + image requests to the Express server during development
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
