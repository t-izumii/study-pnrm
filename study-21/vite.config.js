import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import path from 'path';

export default defineConfig({
  plugins: [glsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@webgl': path.resolve(__dirname, './src/webgl')
    },
    extensions: ['.ts', '.js', '.tsx', '.jsx', '.json']
  },
  server: {
    port: 5173,
    host: true,
    open: false
  },
  build: {
    target: 'esnext',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three']
  },
  esbuild: {
    target: 'esnext'
  }
});
