import React from 'react';
import { GetICUArgs } from './extractICU';
import Translation from './translation';
import { Translator } from './translator';
import { DeepValue, Dict, FlatKeys, Options } from './types';
import { useTranslate as innerUseTranslate } from './useTranslate';

type Values<D extends Dict, K extends string> = GetICUArgs<DeepValue<D, K>>;
type Args<D extends Dict, K extends string> = Record<string, never> extends Values<D, K>
  ? [] | [values: Record<string, any> | undefined] | [values: Record<string, any> | undefined, fallback: string | undefined]
  : [values: Values<D, K>] | [values: Values<D, K>, fallback: string | undefined];

export function createTranslator<D extends Dict>(
  options: Options<D>,
): {
  t: <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) => JSX.Element;
  useTranslate: <K extends FlatKeys<D>>(locale?: string) => (id: K, ...args: Args<D, K>) => string;
  useTranslation: <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) => string;
} {
  const translator = new Translator(options);

  function t<K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) {
    return <Translation translator={translator} id={id} values={args[0]} fallback={args[1]} />;
  }

  function useTranslate(locale?: string) {
    const translate = innerUseTranslate(translator, locale);
    return function <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) {
      return translate({ id, ...args });
    };
  }

  function useTranslation<K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) {
    const translate = useTranslate();
    return translate(id, ...args);
  }

  return {
    t,
    useTranslate,
    useTranslation,
  };
}
