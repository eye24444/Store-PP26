import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset paths relative so the built app works when hosted
// from any subpath (GitHub Pages project sites, Netlify, plain file hosting).
export default defineConfig({
  plugins: [react()],
  base: './',
});
