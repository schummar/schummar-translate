import React, { Fragment, ReactNode, useContext, useMemo } from 'react';
import { HookTranslator, HookTranslatorOptions, TranslationContext } from '.';
import { CreateTranslatorOptions, TranslatorFn } from '..';
import { calcLocales, castArray } from '../helpers';
import { Store } from '../store';
import { translate } from '../translate';
import { internalCreateTranslator } from '../translator';
import { Dict, FlattenDict, Values } from '../types';
import { InlineTranslator, InlineTranslatorOptions, ReactCreateTranslatorResult } from './types';
import { useDicts } from './useDicts';

export function createTranslator<D extends Dict>(options: CreateTranslatorOptions<D>): ReactCreateTranslatorResult<FlattenDict<D>> {
  type FD = FlattenDict<D>;

  const store = new Store(options);
  const { sourceLocale, fallbackLocale = [], fallback: defaultFallback, placeholder: defaultPlaceholder, warn } = options;

  /////////////////////////////////////////////////////////////////////////////
  // hook translator
  /////////////////////////////////////////////////////////////////////////////
  const useTranslator: ReactCreateTranslatorResult<FD>['useTranslator'] = (overrideLocale) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;
    const dicts = useDicts(store, calcLocales(locale, fallbackLocale));
    return useMemo(() => {
      const t: TranslatorFn<FD, HookTranslatorOptions> = (id, ...[values, options]) => {
        const fallback = options?.fallback ?? defaultFallback;
        const placeholder = options?.placeholder ?? defaultPlaceholder;
        return translate({ dicts, id, values, fallback, placeholder, locale, warn, cache: store.cache }) as any;
      };

      return Object.assign(
        //
        t,
        internalCreateTranslator(store, locale, dicts, options),
        {
          unknown: t as HookTranslator<FD>['unknown'],
        },
      );
    }, [store, locale, options]);
  };

  /////////////////////////////////////////////////////////////////////////////
  // inline translator
  /////////////////////////////////////////////////////////////////////////////
  function TranslatorComponent<K extends keyof FD>({
    id,
    values,
    options,
  }: {
    id: K;
    values: Values<FD[K], InlineTranslatorOptions>[0];
    options?: Values<FD[K], InlineTranslatorOptions>[1];
  }) {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = options?.locale ?? contextLocale ?? sourceLocale;
    const dicts = useDicts(store, calcLocales(locale, fallbackLocale));
    const fallback = options?.fallback ?? defaultFallback;
    const placeholder = options?.placeholder ?? defaultPlaceholder;

    const text = useMemo(
      () => translate({ dicts, id, values, fallback, placeholder, locale, warn, cache: store.cache }),
      [locale, dicts, id, values, fallback, placeholder],
    );
    const textArray = castArray(text);
    const Component = options?.component ?? Fragment;

    return (
      <>
        {textArray.map((line, index) => (
          <Component key={index}>{line}</Component>
        ))}
      </>
    );
  }

  const createTranslatorComponent: TranslatorFn<FD, InlineTranslatorOptions, ReactNode> = (id, ...[values, options]) => {
    return <TranslatorComponent id={id} values={values} options={options} />;
  };

  const RenderComponent = ({ renderFn, options }: { renderFn: (t: HookTranslator<FD>) => ReactNode; options?: { locale?: string } }) => {
    const t = useTranslator(options?.locale);
    const value = renderFn(t);
    return <>{value}</>;
  };

  const render: InlineTranslator<FD>['render'] = (renderFn, options) => {
    return <RenderComponent renderFn={renderFn} options={options} />;
  };

  const forwardedKeys = ['dateTimeFormat', 'displayNames', 'listFormat', 'numberFormat', 'pluralRules', 'relativeTimeFormat'] as const;
  const forwarder: { [K in typeof forwardedKeys[number]]: (...args: Parameters<HookTranslator<FD>[K]>) => ReactNode } = {} as any;
  for (const key of forwardedKeys) {
    forwarder[key] = (...args) => render((t) => (t[key] as any)(...args));
  }

  const format: InlineTranslator<FD>['format'] = (id, ...[values]) => {
    return render((t) => t.format(id, values as any));
  };

  const t: InlineTranslator<FD> = Object.assign(
    //
    createTranslatorComponent,
    {
      unknown: createTranslatorComponent as InlineTranslator<FD>['unknown'],
      locale: render((t) => t.locale),
      render,
      format,
    },
    forwarder,
  );

  return {
    getTranslator: async (locale) =>
      internalCreateTranslator(store, locale, await store.loadAll(calcLocales(locale, fallbackLocale)), options),

    useTranslator,
    t,

    clearDicts() {
      store.clear();
    },
  };
}
