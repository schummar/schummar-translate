import { Cache } from './cache';
import { toDate } from './helpers';
import { TemporalLike } from './polyfill/temporal';
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
      return transform((locale) => customDateTimeFormat(cache, locale, options, date));
    },

    dateTimeFormatRange(startDate, endDate, options = dateTimeFormatOptions) {
      return transform((locale) => customDateTimeFormatRange(cache, locale, options, startDate, endDate));
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

export function customDateTimeFormat(
  cache: Cache,
  locale: string | undefined,
  options_: Intl.DateTimeFormatOptions | undefined,
  date_: Date | number | string | TemporalLike | undefined,
) {
  const { date, options } = toDate(date_, options_) ?? {};
  return cache.get(Intl.DateTimeFormat, locale, options).format(date);
}

export function customDateTimeFormatRange(
  cache: Cache,
  locale: string | undefined,
  options_: Intl.DateTimeFormatOptions | undefined,
  startDate_: Date | number | string | TemporalLike,
  endDate_: Date | number | string | TemporalLike,
) {
  const start = toDate(startDate_, options_);
  const end = toDate(endDate_);

  if (start.type !== end.type) {
    throw new Error('Intl.DateTimeFormat.formatRange accepts two values of the same type');
  }

  return cache.get(Intl.DateTimeFormat, locale, start.options).formatRange(start.date, end.date);
}
