import { FlatDict, MaybePromise } from '..';
import { hash } from '../cache';
import { arrEquals } from '../helpers';
import { Store } from '../store';
import { useEffect, useRef, useState } from 'react';

export function useStore<FD extends FlatDict>(store: Store<any, FD, any>, ...locales: string[]): MaybePromise<FD | null>[] {
  const [, setCounter] = useState(0);

  useEffect(() => {
    return store.subscribe(locales, () => {
      setCounter((c) => c + 1);
    });
  }, [store, hash(locales)]);

  const dicts = store.getAll(...locales);
  const ref = useRef(dicts);
  const isEqual = arrEquals(ref.current, dicts);

  useEffect(() => {
    if (!isEqual) {
      ref.current = dicts;
    }
  });

  return isEqual ? ref.current : dicts;
}
