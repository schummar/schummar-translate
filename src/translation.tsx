import React from 'react';
import { Translator } from './translator';
import { Dict, TranslationProps } from './types';
import { useTranslate } from './useTranslate';

export default function Translation<D extends Dict>({
  translator,
  ...props
}: { translator: Translator<D> } & TranslationProps<D>): JSX.Element {
  const translate = useTranslate(translator, props.locale);
  const text = translate(props);

  return <>{text}</>;
}
