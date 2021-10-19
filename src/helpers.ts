export function toDate(d?: Date | number | string): Date | number | undefined {
  if (typeof d === 'string') return new Date(d);
  return d;
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
  fallback?: string | readonly string[] | ((locale: string) => string | readonly string[]),
): readonly string[] {
  const requestedLocales = [locale];
  if (fallback instanceof Function) {
    requestedLocales.push(...castArray(fallback(locale)));
  } else if (fallback) {
    requestedLocales.push(...castArray(fallback));
  }

  return requestedLocales;
}
