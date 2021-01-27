import React from 'react';
import { GetICUArgs } from './extractICU';
import { useFormatter as innnerUseFormatter, useTranslate as innerUseTranslate } from './translate';
import Translation from './translation';
import { Translator } from './translator';
import { DeepValue, Dict, FlatKeys, Options } from './types';

type FormatArgs<T extends string> = Record<string, never> extends GetICUArgs<T> ? [] : [values: GetICUArgs<T>];

type Values<D extends Dict, K extends string> = GetICUArgs<DeepValue<D, K>>;
type Args<D extends Dict, K extends string> = Record<string, never> extends Values<D, K>
  ? [] | [values: Record<string, any> | undefined] | [values: Record<string, any> | undefined, fallback: string | undefined]
  : [values: Values<D, K>] | [values: Values<D, K>, fallback: string | undefined];

export function createTranslator<D extends Dict>(
  options: Options<D>,
): {
  t: <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) => JSX.Element;
  useTranslate: (locale?: string) => <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) => string;
  useTranslation: <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) => string;
  useFormatter: (locale?: string) => <T extends string>(tempalte: T, ...args: FormatArgs<T>) => string;
  useFormat: <T extends string>(template: T, ...args: FormatArgs<T>) => string;
} {
  const translator = new Translator(options);

  function t<K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) {
    return <Translation translator={translator} id={id} values={args[0]} fallback={args[1]} />;
  }

  function useFormatter(locale?: string) {
    const formatter = innnerUseFormatter(locale);
    return function <T extends string>(tempalte: T, ...args: FormatArgs<T>) {
      return formatter(tempalte, ...args);
    };
  }

  function useFormat<T extends string>(template: T, ...args: FormatArgs<T>) {
    const formatter = useFormatter();
    return formatter(template, ...args);
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
    useFormatter,
    useFormat,
  };
}
