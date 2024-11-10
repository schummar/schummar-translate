import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react/index.ts',
  },
  clean: true,
  dts: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
});
