import type { Config } from 'release-it';
export default {
  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'conventionalcommits',
      },
    },
  },
  git: {
    requireCleanWorkingDir: false,
    commit: false,
    tag: false,
    push: false,
  },
  npm: {
    ignoreVersion: true,
  },
} satisfies Config;
