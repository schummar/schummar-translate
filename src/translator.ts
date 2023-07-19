import { TranslatorFn } from '.';
import { calcLocales } from './helpers';
import { intlHelpers } from './intlHelpers';
import { resolveProvidedArgs } from './resolveProvidedArgs';
import { Store } from './store';
import { format, translate } from './translate';
import { CreateTranslatorOptions, CreateTranslatorResult, Dict, FlattenDict, Translator } from './types';

export const createGetTranslator =
  <D extends Dict, ProvidedArgs extends string = never>(
    store: Store<D>,
    {
      fallbackLocale,
      fallbackToLessSpecific = true,
      fallback: globalFallback,
      fallbackIgnoresFallbackLocales = false,
      warn,
      sourceLocale,
      dateTimeFormatOptions,
      listFormatOptions,
      numberFormatOptions,
      pluralRulesOptions,
      relativeTimeFormatOptions,
      ignoreMissingArgs,
      provideArgs,
    }: CreateTranslatorOptions<D, ProvidedArgs>,
  ): ((locale: string) => Promise<Translator<FlattenDict<D>, ProvidedArgs>>) =>
  async (locale: string) => {
    type FD = FlattenDict<D>;

    const dicts = await store.loadAll(locale, ...calcLocales(locale, fallbackToLessSpecific, fallbackLocale));
    const sourceDict = await store.load(sourceLocale);

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
      }),
    });
  };

export function createTranslator<D extends Dict, ProvidedArgs extends string = never>(
  options: CreateTranslatorOptions<D, ProvidedArgs>,
): CreateTranslatorResult<FlattenDict<D>, ProvidedArgs> {
  const store = new Store(options);

  return {
    getTranslator: createGetTranslator(store, options),

    clearDicts() {
      store.clear();
    },
  };
}
