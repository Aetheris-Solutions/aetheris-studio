import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        it: 'it/index.html'
      },
      output: {
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three/fiber')) {
            return 'webgl-runtime';
          }
          if (id.includes('node_modules/react')) {
            return 'react-runtime';
          }
          return undefined;
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 4182
  },
  preview: {
    host: '127.0.0.1',
    port: 4183
  }
});
