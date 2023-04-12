import { Cache } from './cache';
import { toDate } from './helpers';
import { IntlHelpers } from './types';

export function intlHelpers<Output>({
  cache,
  transform,
  dateTimeFormatOptions,
  listFormatOptions,
  numberFormatOptions,
  pluralRulesOptions,
  relativeTimeFormatOptions,
}: {
  cache: Cache;
  transform: (fn: (locale: string) => string) => Output;
  dateTimeFormatOptions?: Intl.DateTimeFormatOptions;
  listFormatOptions?: Intl.ListFormatOptions;
  numberFormatOptions?: Intl.NumberFormatOptions;
  pluralRulesOptions?: Intl.PluralRulesOptions;
  relativeTimeFormatOptions?: Intl.RelativeTimeFormatOptions;
}): IntlHelpers<Output> {
  return {
    dateTimeFormat(date, options = dateTimeFormatOptions) {
      return transform((locale) => cache.get(Intl.DateTimeFormat, locale, options).format(toDate(date)));
    },

    dateTimeFormatRange(startDate, endDate, options = dateTimeFormatOptions) {
      return transform((locale) => cache.get(Intl.DateTimeFormat, locale, options).formatRange(toDate(startDate), toDate(endDate)));
    },

    displayNames(code, options) {
      return transform((locale) => cache.get(Intl.DisplayNames, locale, options).of(code) ?? '');
    },

    listFormat(list, options = listFormatOptions) {
      return transform((locale) => cache.get(Intl.ListFormat, locale, options).format(list));
    },

    numberFormat(number, options = numberFormatOptions) {
      return transform((locale) => cache.get(Intl.NumberFormat, locale, options).format(number));
    },

    // numberFormatRange(start, end, options = numberFormatOptions) {
    //   return transform((locale) => cache.get(Intl.NumberFormat, locale, options).formatRange(start, end));
    // },

    pluralRules(number, options = pluralRulesOptions) {
      return transform((locale) => cache.get(Intl.PluralRules, locale, options).select(number));
    },

    relativeTimeFormat(value, unit, options = relativeTimeFormatOptions) {
      return transform((locale) => cache.get(Intl.RelativeTimeFormat, locale, options).format(value, unit));
    },
  };
}
