import { IntlMessageFormat } from 'intl-messageformat';
import { ReactNode } from 'react';
import { FlatDict } from './types';

const cache = new Map<string, IntlMessageFormat>();

export function translate<F extends ReactNode>(
  dicts: FlatDict[] | undefined,
  { id, values, fallback, locale }: { id: string; values?: any; fallback?: F; locale?: string },
): string | F {
  if (!dicts) return '';

  const dict = dicts.find((dict) => id in dict);
  const template = dict?.[id];

  if (!template) {
    if (fallback !== undefined) return fallback;
    console.warn(`Missing translation: "${id}"`);
    return id;
  }

  return format(template, values, locale);
}

export function format(template: string, values?: Parameters<IntlMessageFormat['format']>[0], locale?: string): string {
  const key = `${locale}:${template}`;
  let f = cache.get(key);
  if (!f) cache.set(key, (f = new IntlMessageFormat(template, locale)));

  try {
    const msg = f.format(values);
    if (msg instanceof Array) return msg.join(' ');
    return String(msg);
  } catch (e) {
    return `Wrong format: ${String(e)}`;
  }
}
