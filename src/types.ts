import { GetICUArgs } from './extractICU';

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////
export type MaybePromise<T> = T | Promise<T>;

/** Merge tuple into intersection */
export type Merge<T> = T extends [infer A, ...infer Rest] ? (Rest extends [any, ...any] ? A & Merge<Rest> : A) : T;

export type FlatKeys<D extends Dict> = string &
  keyof {
    [K in keyof D as D[K] extends Dict ? `${string & K}.${FlatKeys<D[K]>}` : K]: 1;
  };

export type DeepValue<D extends Dict, K extends FlatKeys<D>> = K extends `${infer Head}.${infer Rest}`
  ? DeepValue<D[Head] & Dict, Rest & FlatKeys<D[Head] & Dict>>
  : D[K] extends string | readonly string[]
  ? D[K]
  : '';

export type FlattenDict<D extends Dict> = {
  [K in FlatKeys<D>]: DeepValue<D, K>;
};

////////////////////////////////////////////////////////////////////////////////
// Public types
////////////////////////////////////////////////////////////////////////////////
export type Dict = { [id: string]: Dict | string | readonly string[] };
export type FlatDict = Record<string, string | readonly string[]>;

export type CreateTranslatorOptions<D extends Dict> = {
  sourceDictionary: D;
  sourceLocale: string;
  fallbackLocale?: string | readonly string[];
  dicts?: { [locale: string]: Dict | (() => MaybePromise<Dict>) } | ((locale: string) => MaybePromise<Dict | null>);
  fallback?: string | ((id: string, sourceTranslation: string) => string);
  warn?: (locale: string, id: string) => void;
};

export type CreateTranslatorResult<D extends FlatDict> = {
  getTranslator: GetTranslator<D>;
};

export type Values<T extends string | readonly string[], Options = never> = Record<string, never> extends GetICUArgs<T>
  ? [values?: Record<string, unknown>, options?: Options]
  : GetICUArgs<T> extends never
  ? [values?: Record<string, unknown>, options?: Options]
  : [values: GetICUArgs<T>, options?: Options];

export type TranslateKnown<D extends FlatDict, Options, ReturnValue, ArrayReturnValue> = <K extends keyof D>(
  id: K,
  ...values: Values<D[K], Options>
) => D[K] extends readonly string[] ? ArrayReturnValue : ReturnValue;

export type TranslateUnknown<Options, ReturnValue> = (
  id: string,
  values?: Record<string, unknown>,
  options?: Options,
) => ReturnValue | readonly ReturnValue[];

export type Format<ReturnValue> = <T extends string>(template: T, ...values: Values<T>) => ReturnValue;

export type GetTranslatorOptions = {
  fallback?: string;
};

export type GetTranslator<D extends FlatDict> = (
  locale: string,
) => Promise<
  TranslateKnown<D, GetTranslatorOptions, string, readonly string[]> & {
    unknown: TranslateUnknown<GetTranslatorOptions, string>;
    format: Format<string>;
    locale: string;
  }
>;
