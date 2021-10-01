import { useEffect, useRef, useState } from 'react';
import { FlatDict, MaybePromise } from '..';
import { hash } from '../cache';
import { arrEquals } from '../helpers';
import { Store } from '../store';

export function useStore(store: Store, ...locales: string[]): MaybePromise<FlatDict>[] {
  const [, setCounter] = useState(0);

  useEffect(() => {
    return store.subscribe(locales, () => {
      setCounter((c) => c + 1);
    });
  }, [store, hash(locales)]);

  const dicts = store.getAll(...locales);
  const ref = useRef(dicts);
  if (ref.current !== dicts && !arrEquals(ref.current, dicts)) {
    ref.current = dicts;
  }

  return ref.current;
}
