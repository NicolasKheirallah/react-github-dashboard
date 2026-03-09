import { defineConfig, loadEnv } from 'vite';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const configDirectory = dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, configDirectory, '');

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      globals: true,
      exclude: ['tests/e2e/**', 'node_modules/**'],
    },
  };
});
