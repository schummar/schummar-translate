import React, { createContext, Fragment, ReactNode, useContext, useMemo } from 'react';
import { DictStore } from '../dictStore';
import { format, translate } from '../translate';
import { getTranslator } from '../translator';
import { Dict, FlattenDict, Format, TranslateKnown, TranslateUnknown } from '../types';
import {
  ReactCreateTranslatorOptions,
  ReactCreateTranslatorResult,
  ReactTranslator,
  ReactTranslatorOptions,
  Render,
  UseTranslator,
  UseTranslatorOptions,
} from './types';
import { useFuture } from './useFuture';

export const TranslationContext = createContext({
  locale: typeof window === 'object' && 'navigator' in window ? window.navigator.language.slice(0, 2) : undefined,
});

export const TranslationContextProvider = ({ locale, children }: { locale?: string; children?: React.ReactNode }): JSX.Element => {
  const value = useMemo(() => ({ locale }), [locale]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export function createTranslator<D extends Dict>(options: ReactCreateTranslatorOptions<D>): ReactCreateTranslatorResult<FlattenDict<D>> {
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

  const useTranslator: UseTranslator<FlattenDict<D>> = (overrideLocale) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;
    const localeFallbackOrder = [locale, ...fallbackLocale];
    const dicts = useFuture(() => store.load(...new Set(localeFallbackOrder)), [locale]);

    return useMemo(() => {
      const t: TranslateUnknown<UseTranslatorOptions, string> = (id, ...[values, options]) => {
        const fallback = options?.fallback ?? fallbackDefault;
        const placeholder = options?.placeholder ?? placeholderDefault;
        return translate({ dicts, sourceDict: store.sourceDict, id, values, fallback, placeholder, locale, warn });
      };

      const f: Format<string> = (template, ...[values]) => {
        return format(template, values as any, locale);
      };

      return Object.assign(t as unknown as TranslateKnown<FlattenDict<D>, UseTranslatorOptions, string, readonly string[]>, {
        unknown: t,
        format: f,
        locale,
      });
    }, [fallbackDefault, placeholderDefault, dicts, store.sourceDict, locale, warn]);
  };

  const TranslatorComponent = ({
    id,
    values,
    options,
  }: {
    id: string;
    values?: Record<string, unknown>;
    options?: ReactTranslatorOptions;
  }) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = options?.locale ?? contextLocale ?? sourceLocale;
    const localeFallbackOrder = [locale, ...fallbackLocale];
    const dicts = useFuture(() => store.load(...new Set(localeFallbackOrder)), [locale]);

    const fallback = options?.fallback ?? fallbackElement ?? fallbackDefault;
    const placeholder = options?.placeholder ?? placeholderElement ?? placeholderDefault;

    const text = useMemo(
      () => translate({ dicts, sourceDict: store.sourceDict, id, values, fallback, placeholder, locale, warn }),
      [dicts, store.sourceDict, id, values, fallback, placeholder, locale, warn],
    );
    const textArray = text instanceof Array ? text : [text];
    const Component = options?.component ?? Fragment;

    return (
      <>
        {textArray.map((line, index) => (
          <Component key={index}>{line}</Component>
        ))}
      </>
    );
  };

  const createTranslatorComponent: TranslateUnknown<ReactTranslatorOptions, React.ReactNode> = (id, ...[values, options]) => {
    return <TranslatorComponent {...{ id, values, options }} />;
  };

  const FormatComponent = ({ template, values }: { template: string; values?: Record<string, unknown> }) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = contextLocale ?? sourceLocale;
    const text = useMemo(() => format(template, values, locale), [template, values, locale]);

    return <>{text}</>;
  };

  const createFormatComponent: Format<React.ReactNode> = (template, ...[values]) => {
    return <FormatComponent {...{ template, values: values as any }} />;
  };

  const RenderComponent = ({ renderFn, dependecies = [renderFn] }: { renderFn: (locale: string) => ReactNode; dependecies?: any[] }) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = contextLocale ?? sourceLocale;
    const value = useMemo(() => renderFn(locale), [locale, ...dependecies]);
    return <>{value}</>;
  };

  const createRenderComponent: Render = (renderFn, dependecies) => {
    return <RenderComponent renderFn={renderFn} dependecies={dependecies} />;
  };

  const t: ReactTranslator<FlattenDict<D>> = Object.assign(
    createTranslatorComponent as TranslateKnown<FlattenDict<D>, ReactTranslatorOptions, React.ReactNode, React.ReactNode>,
    {
      unknown: createTranslatorComponent,
      format: createFormatComponent,
      render: createRenderComponent,
    },
  );

  return {
    getTranslator: getTranslator(store, options),
    useTranslator,
    t,
  };
}
