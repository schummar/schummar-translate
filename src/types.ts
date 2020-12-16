////////////////////////////////////////////////////////////////////////////////
// Helpers

////////////////////////////////////////////////////////////////////////////////
export type MaybePromise<T> = T | Promise<T>;

/** Merge tuple into intersection */
export type Merge<T> = T extends [infer A, ...infer Rest] ? (Rest extends [any, ...any] ? A & Merge<Rest> : A) : T;

type Str<T> = T extends string ? T : never;

export type FlatKeys<T extends Record<string, any>> = Str<
  keyof {
    [K in Str<keyof T> as T[K] extends any[] | readonly any[] ? K : T[K] extends Record<string, any> ? `${K}.${FlatKeys<T[K]>}` : K]: 1;
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
  [K in keyof T]: DeepPartial<T[K]>;
};
type DeepPartial<T> = T extends any[] | readonly any[]
  ? string | string[] | readonly string[]
  : T extends Dict
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : string | string[] | readonly string[];

////////////////////////////////////////////////////////////////////////////////
// Public types
////////////////////////////////////////////////////////////////////////////////
export type Dict = { [id: string]: Dict | string | string[] | readonly string[] };
export type FlatDict = { [id: string]: string | string[] | readonly string[] };

export type Options<D extends Dict> = {
  sourceDictionary: D;
  sourceLocale: string;
  fallbackLocale?: string | string[];
  dicts: { [locale: string]: PartialDict<D> } | ((locale: string) => MaybePromise<PartialDict<D> | undefined>);
};

export type Values = Record<string, string | number | boolean | Date | null | undefined>;

export type TranslationProps<D extends Dict = Dict> = { id: FlatKeys<D>; values?: Values; fallback?: string; locale?: string };

// type Open<T extends string> = T extends `${infer Left}{${infer Right}` ? [Left, ...Close<Right>] : [];
// type Close<T extends string> = T extends `${infer Left}}${infer Right}` ? [Left, Right] : [T];

type Open<T extends string> = T extends `${infer Left}{${infer Right}` ? (Left extends `${any}}${any}` ? 1 : Close<'', Right, ''>) : [];

type Classify<T extends string> = T extends `${any}plural${any}` ? { type: 'plural' } : T;

type Close<X extends string, T extends string, Depth extends string> = T extends `${infer L1}}${infer R1}`
  ? L1 extends `${infer L2}{${infer R2}`
    ? Close<`${X}${L2}{`, `${R2}}${R1}`, `${Depth}+`>
    : Depth extends `+${infer Rest}`
    ? Close<`${X}${L1}}`, R1, Rest>
    : [Classify<`${X}${L1}`>, ...Open<R1>]
  : [];

type Z = Open<'123 {count {foo}} {count2, plural, =1 {eins}} 456'>;
