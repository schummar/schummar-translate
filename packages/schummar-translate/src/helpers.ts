import { TemporalLike } from './temporal-polyfill';
import type { CreateTranslatorOptions } from './types';
import { match } from '@formatjs/intl-localematcher';

export function toDate(
  date: Date | number | string | TemporalLike | undefined,
  options: Intl.DateTimeFormatOptions | undefined = {},
): {
  date: Date;
  options: Intl.DateTimeFormatOptions;
  type: 'instant' | 'plainDateTime' | 'plainDate' | 'plainTime';
} {
  if (date instanceof Date) {
    return { date, options, type: 'instant' };
  }

  if (!(date instanceof Object)) {
    return { date: date !== undefined ? new Date(date) : new Date(), options, type: 'instant' };
  }

  if ('epochMilliseconds' in date) {
    return { date: new Date(date.epochMilliseconds), options, type: 'instant' };
  } else {
    const isPlain = !date.timeZone;
    // oxlint-disable-next-line typescript/no-base-to-string
    let iso = date.toString().replace(/\[.*\]/, '') + (isPlain ? 'Z' : '');
    let type: 'instant' | 'plainDateTime' | 'plainDate' | 'plainTime' = 'instant';

    if (isPlain) {
      // Ignore timeZones, time is relative
      options = { ...options, timeZone: 'UTC' };
      type = 'plainDateTime';
    }

    if (date.hour === undefined) {
      // Plain date
      options = { ...options, timeStyle: undefined, hour: undefined, minute: undefined, second: undefined };
      type = 'plainDate';
    }

    if (date.month === undefined) {
      // Plain time
      iso = `1970-01-01T${iso}`;
      options = { ...options, dateStyle: undefined, year: undefined, month: undefined, day: undefined };
      type = 'plainTime';
    }

    return {
      date: new Date(iso),
      options,
      type,
    };
  }
}

export function arrEquals(a?: any[], b?: any[]): boolean {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]) ?? false;
}

export function objEquals(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

export function castArray<T>(x: T | readonly T[] = []): readonly T[] {
  if (x instanceof Array) return x;
  return [x];
}

export function getPossibleLocales(
  locale: string,
  { sourceLocale, dicts, fallbackLocale }: Pick<CreateTranslatorOptions<any, any>, 'sourceLocale' | 'dicts' | 'fallbackLocale'>,
): readonly string[] {
  const requestedLocales = new Set([locale]);

  if (typeof dicts !== 'function') {
    let availableLocales = Object.keys(dicts ?? {}).concat(sourceLocale);
    let matchingLocale: string;

    while ((matchingLocale = match([locale], availableLocales, '', { algorithm: 'best fit' }))) {
      requestedLocales.add(matchingLocale);
      availableLocales = availableLocales.filter((l) => l !== matchingLocale);
    }
  }

  if (fallbackLocale instanceof Function) {
    fallbackLocale = fallbackLocale(locale);
  }
  if (fallbackLocale) {
    for (const x of castArray(fallbackLocale)) {
      requestedLocales.add(x);
    }
  }

  return Array.from(requestedLocales);
}

export function isPromise(x: unknown): x is Promise<unknown> {
  return typeof x === 'object' && x !== null && 'then' in x && typeof x.then === 'function';
}

type Falsy = false | 0 | '' | null | undefined | 0n;

export default function isTruthy<T>(x: T): x is Exclude<T, Falsy> {
  return Boolean(x);
}
