import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/_setup.ts'],
    coverage: {
      reporter: process.env.CI ? ['json-summary', 'json'] : ['text'],
      reportOnFailure: true,
    },
    reporters: process.env.CI ? ['dot', 'github-actions', ['junit', { outputFile: 'test-results.xml' }]] : ['default'],
  },
});