import React from 'react';
import Translation from './translation';
import { Translator } from './translator';
import { Dict, FlatKeys, Options, Values } from './types';

export function createTranslator<D extends Dict>(options: Options<D>) {
  const translator = new Translator(options);

  return {
    translator,
    t: (id: FlatKeys<D>, values?: Values, fallback?: string) => (
      <Translation translator={translator} id={id} values={values} fallback={fallback} />
    ),
  };
}
