export function toDate(d: Date | number | string): Date;
export function toDate(d: Date | number | string | undefined): Date | undefined;
export function toDate(d: Date | number | string | undefined) {
  if (d !== undefined) return new Date(d);
  return;
}

export function arrEquals(a?: any[], b?: any[]): boolean {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]) ?? false;
}

export function castArray<T>(x: T | readonly T[] = []): readonly T[] {
  if (x instanceof Array) return x;
  return [x];
}

export function calcLocales(
  locale: string,
  fallbackToLessSpecific: boolean,
  fallback?: string | readonly string[] | ((locale: string) => string | readonly string[]),
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

  if (fallback instanceof Function) {
    requestedLocales.push(...castArray(fallback(locale)));
  } else if (fallback) {
    requestedLocales.push(...castArray(fallback));
  }

  return requestedLocales;
}
