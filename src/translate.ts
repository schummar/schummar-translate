import { IntlMessageFormat } from 'intl-messageformat';
import { useCallback, useContext } from 'react';
import { TranslationContext } from './translationContext';
import { Translator } from './translator';
import { Dict, FlatDict, TranslationProps } from './types';
import { useDicts } from './useDicts';

const cache = new Map<string, IntlMessageFormat>();

export default function translate<D extends Dict>(
  dicts: FlatDict[] | undefined,
  { id, values, fallback, locale }: TranslationProps<D>,
): string {
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function format(template: string, values?: any, locale?: string): string {
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

export function useTranslate<D extends Dict>(translator: Translator<D>, locale?: string): (props: TranslationProps<D>) => string {
  const { locale: contextLocale } = useContext(TranslationContext);
  locale ??= contextLocale;
  const dicts = useDicts(translator, locale);

  return useCallback(
    (props: TranslationProps<D>) => {
      return translate(dicts, { locale, ...props });
    },
    [dicts, locale],
  );
}

export function useFormatter(locale?: string): (template: string, values?: any) => string {
  const { locale: contextLocale } = useContext(TranslationContext);
  locale ??= contextLocale;

  return useCallback(
    (template, values) => {
      return format(template, values, locale);
    },
    [locale],
  );
}
