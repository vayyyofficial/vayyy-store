import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-store-assets',
      closeBundle() {
        const srcAssets = path.resolve('assets');
        const destAssets = path.resolve('dist/assets');
        if (fs.existsSync(srcAssets)) {
          if (!fs.existsSync(destAssets)) {
            fs.mkdirSync(destAssets, { recursive: true });
          }
          fs.cpSync(srcAssets, destAssets, { recursive: true, force: true });
        }
      }
    }
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-other';
          }
        }
      }
    }
  },
  server: {
    port: 3001,
    open: false
  },
  preview: {
    port: 3001,
    open: false
  }
});
