import { useEffect, useState } from 'react';
import { FlatDict, MaybePromise } from '..';
import { hash } from '../cache';
import { Store } from '../store';

export function useStore(store: Store, ...locales: string[]): MaybePromise<FlatDict>[] {
  const [, setCounter] = useState(0);

  useEffect(() => {
    return store.subscribe(locales, () => {
      setCounter((c) => c + 1);
    });
  }, [store, hash(locales)]);

  return store.getAll(...locales);
}
