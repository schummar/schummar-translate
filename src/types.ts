import { CacheOptions } from './cache';
import { GetICUArgs } from './extractICU';
import { TemporalLike } from './polyfill/temporal';

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

type MatchingKeys<D extends FlatDict, Pattern> = keyof D extends infer K ? (K extends Pattern ? K : never) : never;

////////////////////////////////////////////////////////////////////////////////
// Public types
////////////////////////////////////////////////////////////////////////////////
export type Dict = { [id: string]: Dict | string | readonly string[] };
export type FlatDict = Record<string, string | readonly string[]>;

export interface CreateTranslatorOptions<D extends Dict> {
  /** The source dictionary. It's type determines the available ids. */
  sourceDictionary?: D;
  /** The source dictionary's locale */
  sourceLocale: string;
  /** Locale(s) to fall back to if a string is not available in the active locale */
  fallbackLocale?: string | readonly string[] | ((locale: string) => string | readonly string[]);
  /** Fall back to less specific language versions. E.g. en-US -> en
   * @default true
   */
  fallbackToLessSpecific?: boolean;
  /** Dictionaries. Either a record with locales as keys or a function that takes a locale and returns a promise of a dictionary
   * @param locale the active locale
   */
  dicts?: { [locale: string]: Dict | (() => MaybePromise<Dict>) } | ((locale: string) => MaybePromise<Dict | null>);
  /** Custom fallback handler. Will be called when a string is not available in the active locale.
   * @param id flat dictionary key
   * @param sourceTranslation translated string in source locale
   */
  fallback?: string | ((id: string, sourceTranslation?: string | readonly string[]) => string);
  ignoreMissingArgs?: boolean | string | ((id: string, template: string) => string);
  /** Receive warning when strings are missing. */
  warn?: (locale: string, id: string) => void;
  /** Configure cache for intl instances */
  cacheOptions?: CacheOptions;
  /** Default options */
  dateTimeFormatOptions?: Intl.DateTimeFormatOptions;
  /** Default options */
  listFormatOptions?: Intl.ListFormatOptions;
  /** Default options */
  numberFormatOptions?: Intl.NumberFormatOptions;
  /** Default options */
  pluralRulesOptions?: Intl.PluralRulesOptions;
  /** Default options */
  relativeTimeFormatOptions?: Intl.RelativeTimeFormatOptions;
}

export interface CreateTranslatorResult<D extends FlatDict> {
  /** Returns a promise for a translator instance */
  getTranslator: (locale: string) => Promise<Translator<D>>;

  /** Clear all dictionary data. As needed the dictionaries will be reloaded. Useful for OTA translation updates. */
  clearDicts: () => void;
}

export type Values<T extends string | readonly string[], Options = never> =
  // any string => unknown arguments
  string extends T
    ? [value?: Record<string, unknown>, options?: Options]
    : string[] extends T
    ? [value?: Record<string, unknown>, options?: Options]
    : // for unions, extract arguments for each union member individually
    (T extends any ? (k: GetICUArgs<T>) => void : never) extends (k: infer Args) => void
    ? Args extends Record<string, never>
      ? // if no arguments are found, allow omitting values
        [values?: {}, options?: Options]
      : [values: Args, options?: Options]
    : never;

export interface GetTranslatorOptions {
  /** Override fallback to use if string is not available in active locale */
  fallback?: string;
}

export interface TranslatorFn<D extends FlatDict, Options = GetTranslatorOptions, Output = string> {
  /** Translate a dictionary id to a string in the active locale */
  <TKey extends keyof D, TString extends D[TKey] = D[TKey]>(
    id: TKey,
    ...values: Values<TString, Options>
  ): TString extends readonly string[] ? (Output extends string ? readonly string[] : Output) : Output;
}

export interface Translator<D extends FlatDict, Options = GetTranslatorOptions, Output = string>
  extends TranslatorFn<D, Options, Output>,
    IntlHelpers<Output> {
  locale: Output;

  /** Translate a dictionary id to a string in the active locale. Without type checking the id. */
  unknown(id: string, values?: Record<string, unknown>, options?: Options): Output extends string ? string | readonly string[] : Output;

  /** Translate a dictionary id to a string in the active locale. Without type checking the id. */
  dynamic<
    TKey extends keyof D | (string & {}),
    TMatchingKey extends MatchingKeys<D, TKey> = MatchingKeys<D, TKey>,
    TString extends D[TMatchingKey] = D[TMatchingKey],
  >(
    id: TMatchingKey extends never ? never : TKey,
    ...values: TMatchingKey extends never ? never : Values<TString, Options>
  ): TString extends readonly string[] ? (Output extends string ? readonly string[] : Output) : Output;

  /** Format the given template directly. */
  format<T extends string>(template: T, ...values: Values<T>): Output;
}

export interface IntlHelpers<Output = string> {
  /** Wraps Intl.DateTimeFormat.format */
  dateTimeFormat(date?: Date | number | string | TemporalLike, options?: Intl.DateTimeFormatOptions): Output;

  /** Wraps Intl.DateTimeFormat.formatRange */
  dateTimeFormatRange(
    startDate: Date | number | string | TemporalLike,
    endDate: Date | number | string | TemporalLike,
    options?: Intl.DateTimeFormatOptions,
  ): Output;

  /** Wraps Intl.DisplayNames.of */
  displayNames(code: string, options: Intl.DisplayNamesOptions): Output;

  /** Wraps Intl.ListFormat.format */
  listFormat(list: Iterable<string>, options?: Intl.ListFormatOptions): Output;

  /** Wraps Intl.NumberFormat.format */
  numberFormat(number: number | bigint, options?: Intl.NumberFormatOptions): Output;

  /** Wraps Intl.NumberFormat.formatRange */
  // numberFormatRange(start: number | bigint, end: number | bigint, options?: Intl.NumberFormatOptions): Output;

  /** Wraps Intl.PluralRules.select */
  pluralRules(number: number, options?: Intl.PluralRulesOptions): Output;

  /** Wraps Intl.RelativeTimeFormat.format */
  relativeTimeFormat(value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions): Output;
}

export type ICUArgument = string | number | boolean | Date;
export type ICUNumberArgument = number;
export type ICUDateArgument = Date | number | string | TemporalLike;

export type OtherString = string & { __type: 'other' };
