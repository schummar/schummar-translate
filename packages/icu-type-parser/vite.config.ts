import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: ['index.ts'],
    clean: true,
    dts: true,
    format: ['esm'],
    publint: true,
    exports: true,
  },

  run: {
    tasks: {
      build: {
        command: 'vp pack',
        input: [{ auto: false }, '!node_modules/**/*', '!dist/**/*'],
        output: ['dist/**/*'],
      },
    },
  },
});
