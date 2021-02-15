////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////
export type MaybePromise<T> = T | Promise<T>;

/** Merge tuple into intersection */
export type Merge<T> = T extends [infer A, ...infer Rest] ? (Rest extends [any, ...any] ? A & Merge<Rest> : A) : T;

type Str<T> = T extends string ? T : never;

export type FlatKeys<T extends Record<string, any>> = Str<
  keyof {
    [K in Str<keyof T> as T[K] extends Record<string, any> ? `${K}.${FlatKeys<T[K]>}` : K]: 1;
  }
>;

export type DeepValue<T extends Record<string, any>, K extends string> = K extends `${infer Head}.${infer Rest}`
  ? T[Head] extends Dict
    ? DeepValue<T[Head], Rest>
    : never
  : T[K];

export type FlattenDict<T extends Record<string, any>> = { [K in FlatKeys<T>]: DeepValue<T, K> };

/** Make all nested properties optional */
export type PartialDict<T extends Dict> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};
type DeepPartial<T> = T extends Dict ? { [K in keyof T]?: DeepPartial<T[K]> } : string;

////////////////////////////////////////////////////////////////////////////////
// Public types
////////////////////////////////////////////////////////////////////////////////
export type Dict = { [id: string]: Dict | string };
export type FlatDict = { [id: string]: string };

export type Options<D extends Dict> = {
  sourceDictionary: D;
  sourceLocale: string;
  fallbackLocale?: string | string[];
  dicts:
    | { [locale: string]: PartialDict<D> | (() => MaybePromise<PartialDict<D>>) }
    | ((locale: string) => MaybePromise<PartialDict<D> | null>);
};
