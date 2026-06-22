import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/_setup.ts'],
  },

  pack: {
    entry: {
      index: 'src/index.ts',
      react: 'src/react/index.ts',
    },
    clean: true,
    dts: true,
    sourcemap: true,
    format: ['esm', 'cjs'],
    publint: true,
    exports: true,
    copy: { from: ['../../README.md', '../../LICENSE'], to: './' },
  },

  run: {
    tasks: {
      build: {
        command: 'vp pack',
        input: [{ auto: true }, '!node_modules/**/*', '!dist/**/*', '!README.md', '!LICENSE'],
        output: ['dist/**/*'],
      },
    },
  },
});
