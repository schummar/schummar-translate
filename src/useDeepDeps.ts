import eq from 'fast-deep-equal';
import { useRef } from 'react';

export default function useDeepDeps(...deps: any[]) {
  const ref = useRef(deps);

  if (ref.current !== deps && !eq(ref.current, deps)) {
    ref.current = deps;
  }

  return ref.current;
}
