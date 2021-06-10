import { DependencyList, useEffect, useMemo, useState } from 'react';
import { MaybePromise } from '../types';

export function useFuture<T>(run: () => MaybePromise<T>, deps: DependencyList = []): T | undefined {
  const runResult = useMemo(run, [deps]);
  const [promiseResult, setPromiseResult] = useState<[Promise<T>, T]>();

  useEffect(() => {
    setPromiseResult(undefined);
    if (!(runResult instanceof Promise)) return;

    let canceled = false;
    runResult.then((value) => {
      if (!canceled) setPromiseResult([runResult, value]);
    });

    return () => {
      canceled = true;
    };
  }, [runResult]);

  if (!(runResult instanceof Promise)) return runResult;
  if (promiseResult?.[0] === runResult) return promiseResult[1];
  return undefined;
}
