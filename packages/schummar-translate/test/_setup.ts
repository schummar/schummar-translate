import '@formatjs/intl-durationformat/polyfill.js';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vite-plus/test';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(cleanup);
