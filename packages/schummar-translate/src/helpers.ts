import { TemporalLike } from './temporal-polyfill';

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
  {
    fallbackToLessSpecific = true,
    fallbackToMoreSpecific = true,
    fallbackLocale,
  }: {
    fallbackToLessSpecific?: boolean;
    fallbackToMoreSpecific?: boolean;
    fallbackLocale?: string | readonly string[] | ((locale: string) => string | readonly string[]);
  } = {},
): readonly string[] {
  const requestedLocales = [locale];

  if (fallbackToLessSpecific) {
    let prefix = locale;

    while (prefix.includes('-')) {
      const index = prefix.lastIndexOf('-');
      prefix = prefix.slice(0, index);
      requestedLocales.push(prefix);
    }
  }

  if (fallbackToMoreSpecific) {
    const prefix = locale.split('-')[0];
    requestedLocales.push(`${prefix}-XX`);
  }

  if (fallbackLocale instanceof Function) {
    requestedLocales.push(...castArray(fallbackLocale(locale)));
  } else if (fallbackLocale) {
    requestedLocales.push(...castArray(fallbackLocale));
  }

  return requestedLocales;
}

export function isPromise(x: unknown): x is Promise<unknown> {
  return typeof x === 'object' && x !== null && 'then' in x && typeof x.then === 'function';
}
