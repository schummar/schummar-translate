import React, { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { DictStore } from '../dictStore';
import { GetICUArgs } from '../extractICU';
import { format, translate } from '../translate';
import { DeepValue, Dict, FlatKeys, Options } from '../types';
import { useMaybePromise } from './useMaybePromise';

type TranslateArgs<D extends Dict, K extends string> = Record<string, never> extends GetICUArgs<DeepValue<D, K>>
  ? []
  : [values: GetICUArgs<DeepValue<D, K>>];

type FormatArgs<T extends string> = Record<string, never> extends GetICUArgs<T> ? [] : [values: GetICUArgs<T>];

export const TranslationContext = createContext({
  locale: typeof window === 'object' && 'navigator' in window ? window.navigator.language.slice(0, 2) : undefined,
});

export function createTranslator<D extends Dict>(
  options: Options<D>,
): {
  useTranslateFallback: (overrideLocale?: string) => (id: string, args: { values?: Record<string, any>; fallback: string }) => string;
  tFallback: (id: string, args: { values?: Record<string, any>; fallback: ReactNode }) => JSX.Element;

  useTranslate: (overrideLocale?: string) => <K extends FlatKeys<D>>(id: K, ...args: TranslateArgs<D, K>) => string;
  t: <K extends FlatKeys<D>>(id: K, ...args: TranslateArgs<D, K>) => JSX.Element;

  useFormat: (locale?: string) => <T extends string>(template: T, ...args: FormatArgs<T>) => string;
  f: <T extends string>(template: T, ...[values]: FormatArgs<T>) => JSX.Element;
} {
  const store = new DictStore(options);
  const { sourceLocale, fallbackLocale = [] } = options;

  const useTranslateFallback = (overrideLocale?: string) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;

    const dictsPromise = useMemo(() => {
      const localeFallbackOrder = [locale, ...fallbackLocale, sourceLocale];
      return store.load(...new Set(localeFallbackOrder));
    }, [locale]);
    const dicts = useMaybePromise(dictsPromise);

    return useCallback(
      <F extends ReactNode>(id: string, args: { values?: Record<string, any>; fallback?: F }) => {
        return translate(dicts, { locale, id, ...args });
      },
      [dicts, locale],
    );
  };

  const Translate = ({ id, values, fallback }: { id: string; values?: Record<string, any>; fallback?: ReactNode }) => {
    const translate = useTranslateFallback();
    const text = translate(id, { values, fallback });
    return <>{text}</>;
  };

  const tFallback = (id: string, args: { values?: Record<string, any>; fallback: ReactNode }) => {
    return <Translate id={id} {...args} />;
  };

  const useTranslate = (overrideLocale?: string) => {
    const translate = useTranslateFallback(overrideLocale);

    return useCallback(
      <K extends FlatKeys<D>>(id: K, ...[values]: TranslateArgs<D, K>) => {
        return translate(id, { values: values as any });
      },
      [translate],
    );
  };

  const t = <K extends FlatKeys<D>>(id: K, ...[values]: TranslateArgs<D, K>) => {
    return <Translate id={id} values={values as any} />;
  };

  const useFormat = (overrideLocale?: string) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;

    return useCallback(
      <T extends string>(template: T, ...[values]: FormatArgs<T>) => {
        return format(template, values as any, locale);
      },
      [locale],
    );
  };

  const Format = <T extends string>({
    template,
    values,
    overrideLocale,
  }: {
    template: T;
    values: Record<string, never> extends GetICUArgs<T> ? never : GetICUArgs<T>;
    overrideLocale?: string;
  }) => {
    const format = useFormat(overrideLocale);
    const args = values ? [values] : ([] as any);
    const text = format(template, ...args);
    return <>{text}</>;
  };

  const f = <T extends string>(template: T, ...[values]: FormatArgs<T>) => {
    return <Format template={template} values={values as any} />;
  };

  return {
    useTranslateFallback,
    tFallback,

    useTranslate,
    t,

    useFormat,
    f,
  };
}
