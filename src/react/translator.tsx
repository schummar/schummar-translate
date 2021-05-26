import React, { createContext, useContext, useMemo } from 'react';
import { createTranslator as superCreateTranslator } from '..';
import { DictStore } from '../dictStore';
import { Format, GetTranslator, TranslateKnown, TranslateUnknown } from '../internalTypes';
import { format, translate } from '../translate';
import { Dict } from '../types';
import { Translator, TranslatorOptions, UseTranslator, UseTranslatorOptions } from './internalTypes';
import { OptionsReact } from './types';
import { useFuture } from './useFuture';

export const TranslationContext = createContext({
  locale: typeof window === 'object' && 'navigator' in window ? window.navigator.language.slice(0, 2) : undefined,
});

export const TranslationContextProvider = ({ locale, children }: { locale?: string; children?: React.ReactNode }): JSX.Element => {
  const value = useMemo(() => ({ locale }), [locale]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export function createTranslator<D extends Dict>(
  options: OptionsReact<D>,
): {
  getTranslator: GetTranslator<D>;
  useTranslator: UseTranslator<D>;
  t: Translator<D>;
} {
  const store = new DictStore(options);
  const {
    sourceLocale,
    fallbackLocale = [],
    fallback: fallbackDefault,
    fallbackElement,
    placeholder: placeholderDefault,
    placeholderElement,
    warn,
  } = options;

  const { getTranslator } = superCreateTranslator(options);

  const useTranslator: UseTranslator<D> = (overrideLocale) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;
    const localeFallbackOrder = [locale, ...fallbackLocale];
    const dicts = useFuture(async () => store.load(...new Set(localeFallbackOrder)), [locale]);

    const t: TranslateUnknown<UseTranslatorOptions, string | null> = (id, ...[values, options]) => {
      const fallback = options?.fallback ?? fallbackDefault;
      const placeholder = options?.placeholder ?? placeholderDefault;
      return translate({ dicts, sourceDict: store.sourceDict, id, values, fallback, placeholder, locale, warn });
    };

    const f: Format<string> = (template, ...[values]) => {
      return format(template, values as any, locale);
    };

    return Object.assign(t as TranslateKnown<D, UseTranslatorOptions, string | null>, {
      unknown: t,
      format: f,
    });
  };

  const TranslatorComponent = ({ id, values, options }: { id: string; values?: Record<string, unknown>; options?: TranslatorOptions }) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = options?.locale ?? contextLocale ?? sourceLocale;
    const localeFallbackOrder = [locale, ...fallbackLocale];
    const dicts = useFuture(async () => store.load(...new Set(localeFallbackOrder)), [locale]);

    if (id === 'flatKey') console.log(id, options, contextLocale, localeFallbackOrder, dicts);

    const fallback = options?.fallback ?? fallbackElement ?? fallbackDefault;
    const placeholder = options?.placeholder ?? placeholderElement ?? placeholderDefault;
    const text = translate({ dicts, sourceDict: store.sourceDict, id, values, fallback, placeholder, locale, warn });

    return <>{text}</>;
  };

  const createTranslatorComponent: TranslateUnknown<TranslatorOptions, React.ReactNode> = (id, ...[values, options]) => {
    return <TranslatorComponent {...{ id, values, options }} />;
  };

  const FormatComponent = ({ template, values }: { template: string; values?: Record<string, unknown> }) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = contextLocale ?? sourceLocale;
    const text = format(template, values, locale);

    return <>{text}</>;
  };

  const createFormatComponent: Format<React.ReactNode> = (template, ...[values]) => {
    return <FormatComponent {...{ template, values: values as any }} />;
  };

  const t: Translator<D> = Object.assign(createTranslatorComponent as TranslateKnown<D, TranslatorOptions, React.ReactNode>, {
    unknown: createTranslatorComponent,
    format: createFormatComponent,
  });

  return {
    getTranslator,
    useTranslator,
    t,
  };
}
