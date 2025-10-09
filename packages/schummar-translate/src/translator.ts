import { TranslatorFn } from '.';
import getKeys from './getKeys';
import { getPossibleLocales } from './helpers';
import { intlHelpers } from './intlHelpers';
import { resolveProvidedArgs } from './resolveProvidedArgs';
import { Store } from './store';
import { format, translate } from './translate';
import { CreateTranslatorOptions, CreateTranslatorResult, Dict, FlattenDict, Translator } from './types';
import defaultOptions from './defaultOptions';

export const getTranslator = async <D extends Dict, ProvidedArgs extends string = never>(
  store: Store<D>,
  {
    fallbackLocale,
    fallbackToLessSpecific,
    fallbackToMoreSpecific,
    fallback: globalFallback,
    fallbackIgnoresFallbackLocales,
    warn,
    sourceLocale,
    dateTimeFormatOptions,
    listFormatOptions,
    numberFormatOptions,
    pluralRulesOptions,
    relativeTimeFormatOptions,
    durationFormatOptions,
    ignoreMissingArgs,
    provideArgs,
  }: CreateTranslatorOptions<D, ProvidedArgs>,
  locale: string,
): Promise<Translator<FlattenDict<D>, ProvidedArgs>> => {
  type FD = FlattenDict<D>;

  const dicts = await store.loadAll(
    locale,
    ...getPossibleLocales(locale, { fallbackToLessSpecific, fallbackToMoreSpecific, fallback: fallbackLocale }),
  );
  const sourceDict = store.load(sourceLocale) as FD;

  const t: TranslatorFn<FD, ProvidedArgs> = (id, ...[values, options]) => {
    const fallback = options?.fallback ?? globalFallback;
    return translate({
      dicts,
      sourceDict,
      id,
      values,
      fallback,
      fallbackIgnoresFallbackLocales,
      locale,
      warn,
      cache: store.cache,
      ignoreMissingArgs,
      providedArgs: resolveProvidedArgs(provideArgs),
    }) as any;
  };

  return Object.assign<TranslatorFn<FD, ProvidedArgs>, Omit<Translator<FD, ProvidedArgs>, keyof TranslatorFn<FD, ProvidedArgs>>>(t, {
    locale,

    unknown: t as Translator<FD, ProvidedArgs>['unknown'],
    dynamic: t as Translator<FD, ProvidedArgs>['dynamic'],

    keys: getKeys(sourceDict),

    format(template, ...[values]) {
      return format({
        template,
        values: values as any,
        locale,
        cache: store.cache,
        ignoreMissingArgs,
        providedArgs: resolveProvidedArgs(provideArgs),
      });
    },

    ...intlHelpers({
      cache: store.cache,
      transform: (fn) => fn(locale),
      dateTimeFormatOptions,
      listFormatOptions,
      numberFormatOptions,
      pluralRulesOptions,
      relativeTimeFormatOptions,
      durationFormatOptions,
    }),
  });
};

export function createTranslator<D extends Dict, ProvidedArgs extends string = never>(
  options: CreateTranslatorOptions<D, ProvidedArgs>,
): CreateTranslatorResult<FlattenDict<D>, ProvidedArgs> {
  let store = new Store(options);

  return {
    getTranslator: (locale) => getTranslator(store, defaultOptions(options), locale),

    clearDicts() {
      store.clear();
    },

    updateOptions(newOptions) {
      options = { ...options, ...newOptions };
      store = new Store(options);
    },
  };
}
