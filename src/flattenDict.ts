import { Dict, FlattenDict } from './types';

export function flattenDict<D extends Dict>(dict: D, path = ''): FlattenDict<D> {
  const flat: any = {};

  for (const [key, value] of Object.entries(dict)) {
    const newPath = path ? `${path}.${key}` : key;
    if (value === undefined) continue;
    if (value instanceof Object && !(value instanceof Array)) Object.assign(flat, flattenDict(value, newPath));
    else flat[newPath] = value;
  }

  return flat;
}
