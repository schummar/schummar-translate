import eq from 'fast-deep-equal';
import { useRef } from 'react';

export default function useEqualityRef<T extends any[]>(...deps: T): T {
  const ref = useRef(deps);

  if (!eq(ref.current, deps)) {
    ref.current = deps;
  }

  return ref.current;
}
