import { defineConfig } from 'vite';

// Relative base so the build works on any static host (GitHub Pages, Netlify, itch.io...)
export default defineConfig({
  base: './',
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 1200,
  },
});
