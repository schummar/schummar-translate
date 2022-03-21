import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(cleanup);
