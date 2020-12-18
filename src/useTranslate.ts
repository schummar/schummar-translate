import { useCallback, useContext } from 'react';
import translate from './translate';
import { TranslationContext } from './translationContext';
import { Translator } from './translator';
import { Dict, TranslationProps } from './types';
import { useDicts } from './useDicts';

export function useTranslate<D extends Dict>(translator: Translator<D>, locale?: string): (props: TranslationProps<D>) => string {
  const { locale: contextLocale } = useContext(TranslationContext);
  locale ??= contextLocale;
  const dicts = useDicts(translator, locale);

  return useCallback(
    (props: TranslationProps<D>) => {
      return translate(dicts, { locale, ...props });
    },
    [dicts],
  );
}
