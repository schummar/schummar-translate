import type { Config } from 'release-it';

export default {
  plugins: {
    '@release-it/conventional-changelog': {
      //   whatBump: false,
      preset: {
        name: 'conventionalcommits',
      },
    },
  },
  git: {
    requireCleanWorkingDir: false,
    commit: false,
    tag: true,
    push: true,
  },
  github: {
    release: true,
  },
  npm: {
    publish: false,
  },
} satisfies Config;
