import { TranslatorFn } from '.';
import { castArray, toDate } from './helpers';
import { Store } from './store';
import { format, translate } from './translate';
import { CreateTranslatorOptions, CreateTranslatorResult, Dict, FlattenDict, Translator } from './types';

export const createGetTranslator =
  <D extends Dict>(
    store: Store<D>,
    {
      fallbackLocale,
      fallback: globalFallback,
      warn,
      sourceLocale,
      dateTimeFormatOptions,
      displayNamesOptions,
      listFormatOptions,
      numberFormatOptions,
      pluralRulesOptions,
      relativeTimeFormatOptions,
    }: CreateTranslatorOptions<D>,
  ): ((locale: string) => Promise<Translator<FlattenDict<D>>>) =>
  async (locale: string) => {
    type FD = FlattenDict<D>;

    const dicts = await store.loadAll(locale, ...castArray(fallbackLocale));
    const sourceDict = await store.load(sourceLocale);

    const t: TranslatorFn<FD> = (id, ...[values, options]) => {
      const fallback = options?.fallback ?? globalFallback;
      return translate({ dicts, sourceDict, id, values, fallback, locale, warn, cache: store.cache }) as any;
    };

    return Object.assign<TranslatorFn<FD>, Omit<Translator<FD>, keyof TranslatorFn<FD>>>(t, {
      locale,

      unknown: t as Translator<FD>['unknown'],

      format(template, ...[values]) {
        return format({ template, values: values as any, locale, cache: store.cache });
      },

      dateTimeFormat(date, options = dateTimeFormatOptions) {
        return store.cache.get(Intl.DateTimeFormat, locale, options).format(toDate(date));
      },

      displayNames(code, options = displayNamesOptions) {
        // TODO remove cast when DisplayNames is included in standard lib
        return store.cache.get((Intl as any).DisplayNames, locale, options).of(code);
      },

      listFormat(list, options = listFormatOptions) {
        // TODO remove cast when DisplayNames is included in standard lib
        return store.cache.get((Intl as any).ListFormat, locale, options).format(list);
      },

      numberFormat(number, options = numberFormatOptions) {
        return store.cache.get(Intl.NumberFormat, locale, options).format(number);
      },

      pluralRules(number, options = pluralRulesOptions) {
        return store.cache.get(Intl.PluralRules, locale, options).select(number);
      },

      relativeTimeFormat(value, unit, options = relativeTimeFormatOptions) {
        return store.cache.get(Intl.RelativeTimeFormat, locale, options).format(value, unit);
      },
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
