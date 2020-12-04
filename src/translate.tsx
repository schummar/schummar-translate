import React, { useContext, useMemo } from 'react';
import { LocaleContext } from './context';
import { Dict, TranslationProps } from './types';
import { Translator } from './translator';
import useDeepDeps from './useDeepDeps';

type Props = {
  translator: Translator<any>;
} & TranslationProps;

const browserLocale = 'navigator' in window ? window.navigator.language : undefined;

export default function Translate<D extends Dict>({ translator, key, values, fallback, locale }: Props<D>) {
  let { locale: contextLocale } = useContext(LocaleContext);
  locale ??= contextLocale ?? browserLocale;
  const dict = translator.useDict(locale);

  const template = dict?.[key];

  return 'ok';
}
