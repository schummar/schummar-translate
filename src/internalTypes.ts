import { GetICUArgs } from './extractICU';
import { DeepValue, Dict, FlatKeys } from './types';

export type Values<T, Options = never> = Record<string, never> extends GetICUArgs<T>
  ? [values?: Record<string, never>, options?: Options]
  : [values: GetICUArgs<T>, options?: Options];

export type TranslateKnown<D extends Dict, Options, ReturnValue> = <K extends FlatKeys<D>>(
  id: K,
  ...values: Values<DeepValue<D, K>, Options>
) => ReturnValue;

export type TranslateUnknown<Options, ReturnValue> = (id: string, values?: Record<string, unknown>, options?: Options) => ReturnValue;

export type Format<ReturnValue> = <T extends string>(template: T, ...values: Values<T>) => ReturnValue;

export type GetTranslatorOptions = {
  fallback?: string;
};

export type GetTranslator<D extends Dict> = (locale: string) => Promise<
  TranslateKnown<D, GetTranslatorOptions, string> & {
    unknown: TranslateUnknown<GetTranslatorOptions, string>;
    format: Format<string>;
  }
>;
