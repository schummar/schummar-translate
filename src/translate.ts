import { IntlMessageFormat } from 'intl-messageformat';
import { FlatDict } from './types';

const cache = new Map<string, IntlMessageFormat>();

export function translate<F = never>({
  dicts,
  sourceDict,
  id,
  values,
  fallback,
  placeholder,
  locale,
  warn,
}: {
  dicts?: FlatDict[];
  sourceDict: FlatDict;
  id: string;
  values?: any;
  fallback?: F | ((id: string, sourceTranslation: string) => F);
  placeholder?: F | ((id: string, sourceTranslation: string) => F);
  locale: string;
  warn?: (locale: string, id: string) => void;
}): string | F {
  if (!dicts) {
    if (placeholder instanceof Function) {
      const sourceTranslation = translate<string>({ dicts: [sourceDict], sourceDict, id, values, locale });
      return placeholder(id, sourceTranslation as string);
    }
    return placeholder ?? '';
  }

  if (fallback !== undefined) {
    dicts = dicts.slice(0, 1);
  }

  const dict = dicts.find((dict) => id in dict);
  const template = dict?.[id];

  if (!template) {
    if (fallback instanceof Function) {
      const sourceTranslation = translate<string>({ dicts: [sourceDict], sourceDict, id, values, locale });
      return fallback(id, sourceTranslation as string);
    }
    if (fallback !== undefined) return fallback;

    warn?.(locale, id);
    return id;
  }

  return format(template, values, locale);
}

export function format(template: string, values?: Record<string, unknown>, locale?: string): string {
  try {
    const key = `${locale}:${template}`;
    let f = cache.get(key);
    if (!f) cache.set(key, (f = new IntlMessageFormat(template, locale)));

    const msg = f.format(values);
    if (msg instanceof Array) return msg.join(' ');
    return String(msg);
  } catch (e) {
    return `Wrong format: ${String(e)}`;
  }
}
