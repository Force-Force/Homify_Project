import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    watch: {
      // Évite EMFILE sur Linux quand trop de dossiers sont surveillés (monorepo, IDE, etc.)
      usePolling: process.env.VITE_USE_POLLING === '1',
      interval: 500,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.venv/**',
        '**/__pycache__/**',
        '**/.cursor/**',
        '**/agent-transcripts/**',
        '../Backend_homify/**',
      ],
    },
    fs: {
      strict: true,
      allow: [frontendRoot],
    },
  },
});
