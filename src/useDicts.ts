import { useEffect, useState } from 'react';
import { Translator } from './translator';
import { Dict, FlatDict } from './types';

export function useDicts<D extends Dict>(translator: Translator<D>, locale?: string): FlatDict[] {
  const [dicts, setDicts] = useState<FlatDict[]>([translator.sourceDict]);

  useEffect(() => {
    if (!locale) return;
    let cancel = false;

    const orderedLocales = [...new Set([locale].concat(translator.options.fallbackLocale ?? [], translator.options.sourceLocale))];

    Promise.all(orderedLocales.map((locale) => translator.load(locale))).then((dicts) => {
      if (!cancel) setDicts(dicts);
    });

    return () => {
      cancel = true;
    };
  }, [translator, locale]);

  return dicts;
}
