import { DeepPartial, Dict, FlatDict, Merge } from './types';

function mergeImpl(a: any, b: any) {
  const result = { ...a };

  for (const key in b) {
    if (!(key in result) || typeof b[key] !== 'object' || typeof result[key] !== 'object') {
      result[key] = b[key];
    } else {
      result[key] = mergeImpl(result[key], b[key]);
    }
  }

  return result;
}

export function mergeDicts<Parts extends Dict[]>(...parts: Parts): Merge<Parts> {
  return parts.reduce(mergeImpl, {}) as Merge<Parts>;
}

export function flattenDict<D extends DeepPartial<Dict>>(dict: D, path = ''): FlatDict {
  const flat: FlatDict = {};

  for (const [key, value] of Object.entries(dict)) {
    const newPath = path ? `${path}.${key}` : key;
    if (value === undefined) continue;
    if (value instanceof Array || !(value instanceof Object)) flat[newPath] = value;
    else Object.assign(flat, flattenDict(value, newPath));
  }

  return flat;
}
