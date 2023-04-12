import { TranslatorFn } from '.';
import { calcLocales } from './helpers';
import { intlHelpers } from './intlHelpers';
import { Store } from './store';
import { format, translate } from './translate';
import { CreateTranslatorOptions, CreateTranslatorResult, Dict, FlattenDict, Translator } from './types';

export const createGetTranslator =
  <D extends Dict>(
    store: Store<D>,
    {
      fallbackLocale,
      fallbackToLessSpecific = true,
      fallback: globalFallback,
      warn,
      sourceLocale,
      dateTimeFormatOptions,
      listFormatOptions,
      numberFormatOptions,
      pluralRulesOptions,
      relativeTimeFormatOptions,
      ignoreMissingArgs,
    }: CreateTranslatorOptions<D>,
  ): ((locale: string) => Promise<Translator<FlattenDict<D>>>) =>
  async (locale: string) => {
    type FD = FlattenDict<D>;

    const dicts = await store.loadAll(locale, ...calcLocales(locale, fallbackToLessSpecific, fallbackLocale));
    const sourceDict = await store.load(sourceLocale);

    const t: TranslatorFn<FD> = (id, ...[values, options]) => {
      const fallback = options?.fallback ?? globalFallback;
      return translate({ dicts, sourceDict, id, values, fallback, locale, warn, cache: store.cache, ignoreMissingArgs }) as any;
    };

    return Object.assign<TranslatorFn<FD>, Omit<Translator<FD>, keyof TranslatorFn<FD>>>(t, {
      locale,

      unknown: t as Translator<FD>['unknown'],

      format(template, ...[values]) {
        return format({ template, values: values as any, locale, cache: store.cache });
      },

      ...intlHelpers({
        cache: store.cache,
        transform: (fn) => fn(locale),
        dateTimeFormatOptions,
        listFormatOptions,
        numberFormatOptions,
        pluralRulesOptions,
        relativeTimeFormatOptions,
      }),
    });
  };

export function createTranslator<D extends Dict>(options: CreateTranslatorOptions<D>): CreateTranslatorResult<FlattenDict<D>> {
  const store = new Store(options);

  return {
    getTranslator: createGetTranslator(store, options),

    clearDicts() {
      store.clear();
    },
  };
}
