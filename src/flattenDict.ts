import { Dict, FlatDict, PartialDict } from './types';

export function flattenDict<D extends PartialDict<Dict>>(dict: D, path = ''): FlatDict {
  const flat: FlatDict = {};

  for (const [key, value] of Object.entries(dict)) {
    const newPath = path ? `${path}.${key}` : key;
    if (value === undefined) continue;
    if (value instanceof Object) Object.assign(flat, flattenDict(value as PartialDict<Dict>, newPath));
    else flat[newPath] = value;
  }

  return flat;
}
