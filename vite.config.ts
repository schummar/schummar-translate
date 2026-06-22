import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    printWidth: 140,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: true,
    sortPackageJson: true,
    sortImports: {
      groups: [],
      newlinesBetween: false,
      partitionByNewline: true,
    },
  },

  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  test: {
    projects: ['packages/*'],
  },

  run: {
    tasks: {
      _lint: {
        command: 'vp fmt --check && vp lint',
        input: [{ auto: true }, '!**/dist/**', '!**/node_modules/**'],
      },

      _test: {
        command: 'vp test',
        input: [{ auto: true }, '!**/dist/**', '!**/node_modules/**'],
      },
    },
  },
});
