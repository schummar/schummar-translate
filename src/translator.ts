import { DictStore } from './dictStore';
import { format, translate } from './translate';
import {
  CreateTranslatorOptions,
  CreateTranslatorResult,
  Dict,
  FlattenDict,
  Format,
  GetTranslator,
  GetTranslatorOptions,
  TranslateKnown,
  TranslateUnknown,
} from './types';

export const getTranslator =
  <D extends Dict>(
    store: DictStore<D>,
    { fallbackLocale = [], fallback: globalFallback, warn }: CreateTranslatorOptions<D>,
  ): GetTranslator<FlattenDict<D>> =>
  async (locale: string) => {
    const localeFallbackOrder = [locale, ...fallbackLocale];
    const dicts = await store.load(...new Set(localeFallbackOrder));

    const t: TranslateUnknown<GetTranslatorOptions, string> = (id, ...[values, options]) => {
      const fallback = options?.fallback ?? globalFallback;
      return translate({ dicts, sourceDict: store.sourceDict, id, values, fallback, locale, warn });
    };

    const f: Format<string> = (template, ...[values]) => {
      return format(template, values as any, locale);
    };

    return Object.assign(t as unknown as TranslateKnown<FlattenDict<D>, GetTranslatorOptions, string, readonly string[]>, {
      unknown: t,
      format: f,
    });
  };

export function createTranslator<D extends Dict>(options: CreateTranslatorOptions<D>): CreateTranslatorResult<FlattenDict<D>> {
  const store = new DictStore(options);

  return {
    getTranslator: getTranslator(store, options),
  };
}
