
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  }
});
