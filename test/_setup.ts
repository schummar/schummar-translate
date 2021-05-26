import { cleanup } from '@testing-library/react';
import test from 'ava';

test.afterEach.always(cleanup);
