import React from 'react';
import { Translator } from './translator';
import { Dict, TranslationProps } from './types';

export default function Translation<D extends Dict>({ translator, ...props }: { translator: Translator<D> } & TranslationProps<D>) {
  const translate = translator.useTranslate(props.locale);
  const text = translate(props);

  return <>{text instanceof Array ? text.map((paragraph, index) => <p key={index}>{paragraph}</p>) : text}</>;
}
