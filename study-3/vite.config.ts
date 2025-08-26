import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [glsl()],
  resolve: {
    alias: {
      '@webgl': '/src/webgl'
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        }
      }
    }
  },
  esbuild: {
    target: 'es2020'
  }
})
