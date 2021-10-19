import { useEffect, useMemo, useState } from 'react';
import { FlatDict } from '..';
import { hash } from '../cache';
import { Store } from '../store';

export function useDicts(store: Store, locales: readonly string[]): FlatDict[] | undefined {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    return store.subscribe(locales, () => {
      setCounter((c) => c + 1);
    });
  }, [store, hash(locales)]);

  return useMemo(() => store.getAll(locales), [store, hash(locales), counter]);
}
