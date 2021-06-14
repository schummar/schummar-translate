////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////
export type MaybePromise<T> = T | Promise<T>;

/** Merge tuple into intersection */
export type Merge<T> = T extends [infer A, ...infer Rest] ? (Rest extends [any, ...any] ? A & Merge<Rest> : A) : T;

export type FlatKeys<T extends Record<string, unknown>> = string &
  keyof {
    [K in keyof T as T[K] extends Record<string, unknown> ? `${string & K}.${FlatKeys<T[K]>}` : K]: 1;
  };

export type DeepValue<T extends Record<string, unknown>, K extends string> = K extends `${infer Head}.${infer Rest}`
  ? T[Head] extends Dict
    ? DeepValue<T[Head], Rest>
    : never
  : T[K];

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
  dicts?:
    | { [locale: string]: PartialDict<D> | (() => MaybePromise<PartialDict<D>>) }
    | ((locale: string) => MaybePromise<PartialDict<D> | null>);
  fallback?: string | ((id: string, sourceTranslation: string) => string);
  warn?: (locale: string, id: string) => void;
};
