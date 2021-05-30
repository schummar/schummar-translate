import { DependencyList, useEffect, useState } from 'react';

export function useFuture<T>(run: () => Promise<T>, deps: DependencyList = []): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    setValue(undefined);

    let canceled = false;
    run().then((value) => {
      if (!canceled) setValue(value);
    });

    return () => {
      canceled = true;
    };
  }, deps);

  return value;
}
