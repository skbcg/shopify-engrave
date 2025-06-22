import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  root: 'web',
  publicDir: 'public',
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    open: true,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'web/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'web/src'),
    },
  },
});
