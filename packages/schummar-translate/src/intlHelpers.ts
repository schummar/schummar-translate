import { Cache } from './cache';
import { toDate } from './helpers';
import type { ReactCreateTranslatorOptions } from './react';
import { TemporalLike } from './temporal-polyfill';
import { IntlHelpers } from './types';

export function intlHelpers<Output>(
  render: (
    fn: (
      locale: string,
      cache: Cache,
      options: Pick<
        ReactCreateTranslatorOptions<any, any>,
        | 'dateTimeFormatOptions'
        | 'displayNamesOptions'
        | 'listFormatOptions'
        | 'numberFormatOptions'
        | 'pluralRulesOptions'
        | 'relativeTimeFormatOptions'
        | 'durationFormatOptions'
      >,
    ) => string,
  ) => Output,
): IntlHelpers<Output> {
  return {
    dateTimeFormat(date, dateTimeFormatOptions) {
      return render((locale, cache, options) =>
        customDateTimeFormat(cache, locale, dateTimeFormatOptions ?? options.dateTimeFormatOptions, date),
      );
    },

    dateTimeFormatRange(startDate, endDate, dateTimeFormatOptions) {
      return render((locale, cache, options) =>
        customDateTimeFormatRange(cache, locale, dateTimeFormatOptions ?? options.dateTimeFormatOptions, startDate, endDate),
      );
    },

    displayNames(code, displayNamesOptions) {
      return render(
        (locale, cache, options) => cache.get(Intl.DisplayNames, locale, displayNamesOptions ?? options.displayNamesOptions).of(code) ?? '',
      );
    },

    listFormat(list, listFormatOptions) {
      return render((locale, cache, options) =>
        cache.get(Intl.ListFormat, locale, listFormatOptions ?? options.listFormatOptions).format(list),
      );
    },

    numberFormat(number, numberFormatOptions) {
      return render((locale, cache, options) =>
        cache.get(Intl.NumberFormat, locale, numberFormatOptions ?? options.numberFormatOptions).format(number),
      );
    },

    // numberFormatRange(start, end, options = numberFormatOptions) {
    //   return transform((locale) => cache.get(Intl.NumberFormat, locale, options).formatRange(start, end));
    // },

    pluralRules(number, pluralRulesOptions) {
      return render((locale, cache, options) =>
        cache.get(Intl.PluralRules, locale, pluralRulesOptions ?? options.pluralRulesOptions).select(number),
      );
    },

    relativeTimeFormat(value, unit, relativeTimeFormatOptions) {
      return render((locale, cache, options) =>
        cache.get(Intl.RelativeTimeFormat, locale, relativeTimeFormatOptions ?? options.relativeTimeFormatOptions).format(value, unit),
      );
    },

    durationFormat(duration, durationFormatOptions) {
      const intl = Intl as { DurationFormat?: any };
      if (!intl.DurationFormat) {
        throw new Error('Intl.DurationFormat is not available in this environment. Try using the polyfill');
      }
      return render((locale, cache, options) =>
        cache.get(intl.DurationFormat, locale, durationFormatOptions ?? options.durationFormatOptions).format(duration),
      );
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
