import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/banquet-power-simulator/',
  build: {
    target: 'es2015', // Lower target for older browsers
    cssTarget: 'chrome61', // Android 9 equivalent
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});