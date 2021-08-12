export function mapPotentialArray<T, S>(value: T | readonly T[], fn: (value: T) => S): S | S[] {
  if (value instanceof Array) return value.map(fn);
  return fn(value);
}
