import { TranslatorFn } from '.';
import defaultOptions from './defaultOptions';
import getKeys from './getKeys';
import { getPossibleLocales } from './helpers';
import { intlHelpers } from './intlHelpers';
import { Store } from './store';
import { format, translate } from './translate';
import { CreateTranslatorOptions, CreateTranslatorResult, Dict, FlattenDict, Translator } from './types';

export const getTranslator = async <D extends Dict, ProvidedArgs extends string = never>(
  store: Store<D>,
  options: CreateTranslatorOptions<D, ProvidedArgs>,
  locale: string,
): Promise<Translator<FlattenDict<D>, ProvidedArgs>> => {
  type FD = FlattenDict<D>;

  const dicts = await store.loadAll(locale, ...getPossibleLocales(locale, options));
  const sourceDict = store.load(options.sourceLocale) as FD;

  const t: TranslatorFn<FD, ProvidedArgs> = (id, ...[values, translatorOptions]) => {
    const fallback = translatorOptions?.fallback ?? options.fallback;

    return translate({
      dicts,
      sourceDict,
      id,
      values,
      fallback,
      fallbackIgnoresFallbackLocales: options.fallbackIgnoresFallbackLocales,
      locale,
      warn: options.warn,
      debug: options.debug,
      cache: store.cache,
      ignoreMissingArgs: options.ignoreMissingArgs,
      providedArgs: options.provideArgs,
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
        ignoreMissingArgs: options.ignoreMissingArgs,
        providedArgs: options.provideArgs,
      });
    },

    ...intlHelpers((fn) => fn(locale, store.cache, options)),
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
