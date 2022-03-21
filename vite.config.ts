/// <reference types="vitest" />
import { isAbsolute } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/_setup.ts'],
  },

  build: {
    sourcemap: true,
    minify: false,

    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
    },

    rollupOptions: {
      input: {
        index: './src/index.ts',
        react: './src/react/index.ts',
      },
      output: {
        entryFileNames: '[format]/[name].js',
        chunkFileNames: '[format]/[name].js',
      },
      external: (source) => {
        return !(isAbsolute(source) || source.startsWith('.'));
      },
    },
  },
});
