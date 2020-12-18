import { IntlMessageFormat } from 'intl-messageformat';
import { Dict, FlatDict, TranslationProps } from './types';

const cache = new Map<string, IntlMessageFormat>();

export default function translate<D extends Dict>(
  dicts: FlatDict[] | undefined,
  { id, values, fallback, locale }: TranslationProps<D>,
): string | string[] {
  if (!dicts) return '';

  const dict = dicts.find((dict) => id in dict);
  const template = dict?.[id];
  if (!template) {
    if (fallback !== undefined) return [fallback];
    console.warn(`Missing translation: "${id}"`);
    return [id];
  }

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
