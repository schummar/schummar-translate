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
      entry: {
        index: './src/index.ts',
        react: './src/react/index.ts',
        astro: './src/astro/index.ts',
        astroIntegration: './src/astro/integration.ts',
      },
    },

    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: '[format]/[name].mjs',
          chunkFileNames: '[format]/[name].mjs',
        },
        {
          format: 'cjs',
          entryFileNames: '[format]/[name].cjs',
          chunkFileNames: '[format]/[name].cjs',
        },
      ],
      external: (source) => {
        return !(isAbsolute(source) || source.startsWith('.'));
      },
    },
  },
});
