import { Dict, Merge } from './types';

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
