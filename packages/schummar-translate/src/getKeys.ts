import { isPromise } from './helpers';
import type { FlatDict, MaybePromise } from './types';

export default function getKeys<D extends FlatDict>(dict: MaybePromise<D | null | undefined>) {
  function inner(): (keyof D)[];
  function inner<TPrefix extends string>(prefix: TPrefix): (keyof D & (TPrefix | `${TPrefix}.${string}`))[];
  function inner(prefix?: string) {
    if (isPromise(dict)) {
      return [];
    }

    return Object.keys(dict ?? {})
      .filter((key) => prefix === undefined || key === prefix || key.startsWith(`${prefix}.`))
      .sort();
  }

  return inner;
}
