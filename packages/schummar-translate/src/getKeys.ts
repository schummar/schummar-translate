import type { FlatDict } from './types';

export default function getKeys<D extends FlatDict>(dict: D | null | (() => D | null)) {
  function inner(): (keyof D)[];
  function inner<TPrefix extends string>(prefix: TPrefix): (keyof D & (TPrefix | `${TPrefix}.${string}`))[];
  function inner(prefix?: string) {
    if (dict instanceof Function) {
      dict = dict();
    }

    return Object.keys(dict ?? {})
      .filter((key) => prefix === undefined || key === prefix || key.startsWith(`${prefix}.`))
      .sort();
  }

  return inner;
}
