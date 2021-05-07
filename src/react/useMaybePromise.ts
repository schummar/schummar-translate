import { useEffect, useState } from 'react';
import { MaybePromise } from '../types';

export function useMaybePromise<T>(promise: MaybePromise<T>): T | undefined {
  const [value, setValue] = useState(promise);

  useEffect(() => {
    let canceled = false;
    Promise.resolve(promise).then((value) => {
      if (!canceled) setValue(value);
    });

    return () => {
      canceled = true;
    };
  }, [promise]);

  return value instanceof Promise ? undefined : value;
}
