import React, { Fragment, ReactNode, useContext, useMemo } from 'react';
import { TranslationContext } from '.';
import { TranslatorFn } from '..';
import { hash } from '../cache';
import { castArray, toDate } from '../helpers';
import { Store } from '../store';
import { format, translate } from '../translate';
import { createGetTranslator } from '../translator';
import { Dict, FlattenDict, Values } from '../types';
import {
  HookTranslator,
  HookTranslatorOptions,
  InlineTranslator,
  InlineTranslatorOptions,
  ReactCreateTranslatorOptions,
  ReactCreateTranslatorResult,
} from './types';
import { useStore } from './useStore';

export function createTranslator<D extends Dict>(options: ReactCreateTranslatorOptions<D>): ReactCreateTranslatorResult<FlattenDict<D>> {
  type FD = FlattenDict<D>;

  const store = new Store(options);
  const { sourceLocale, fallbackLocale = [], fallback: defaultFallback, placeholder: defaultPlaceholder, warn } = options;

  /////////////////////////////////////////////////////////////////////////////
  // hook translator
  /////////////////////////////////////////////////////////////////////////////
  const useTranslator: ReactCreateTranslatorResult<FD>['useTranslator'] = (overrideLocale) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;
    const dicts = useStore(store, locale, ...castArray(fallbackLocale));
    const [sourceDict] = useStore(store, sourceLocale) ?? [];

    return useMemo(() => {
      const t: TranslatorFn<FD, HookTranslatorOptions, string> = (id, ...[values, options]) => {
        const fallback = options?.fallback ?? defaultFallback;
        const placeholder = options?.placeholder ?? defaultPlaceholder;
        return translate({ dicts, sourceDict, id, values, fallback, placeholder, locale, warn }) as any;
      };

      return Object.assign<TranslatorFn<FD>, Omit<HookTranslator<FD>, keyof TranslatorFn<FD>>>(t, {
        locale,

        unknown: t as HookTranslator<FD>['unknown'],

        format(template, ...[values]) {
          return format(template, values as any, locale);
        },

        dateTimeFormat(date, options) {
          return store.cache.get(Intl.DateTimeFormat, locale, options).format(toDate(date));
        },

        displayNames(code, options) {
          // TODO remove cast when DisplayNames is included in standard lib
          return store.cache.get((Intl as any).DisplayNames, locale, options).of(code);
        },

        listFormat(list, options) {
          // TODO remove cast when DisplayNames is included in standard lib
          return store.cache.get((Intl as any).ListFormat, locale, options).format(list);
        },

        numberFormat(number, options) {
          return store.cache.get(Intl.NumberFormat, locale, options).format(number);
        },

        pluralRules(number, options) {
          return store.cache.get(Intl.PluralRules, locale, options).select(number);
        },

        relativeTimeFormat(value, unit, options) {
          return store.cache.get(Intl.RelativeTimeFormat, locale, options).format(value, unit);
        },
      });
    }, [locale, dicts, sourceDict]);
  };

  /////////////////////////////////////////////////////////////////////////////
  // inline translator
  /////////////////////////////////////////////////////////////////////////////
  function TranslatorComponent<K extends keyof FD>({
    id,
    values,
    options,
  }: {
    id: string;
    values: Values<FD[K], InlineTranslatorOptions>[0];
    options?: Values<FD[K], InlineTranslatorOptions>[1];
  }) {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = options?.locale ?? contextLocale ?? sourceLocale;
    const dicts = useStore(store, locale, ...castArray(fallbackLocale));
    const [sourceDict] = useStore(store, sourceLocale) ?? [];

    const fallback = options?.fallback ?? defaultFallback;
    const placeholder = options?.placeholder ?? defaultPlaceholder;

    const text = useMemo(
      () => translate({ dicts, sourceDict, id, values, fallback, placeholder, locale, warn }),
      [locale, dicts, sourceDict, id, values, fallback, placeholder],
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

  const FormatComponent = ({ template, values }: { template: string; values?: Record<string, unknown> }) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = contextLocale ?? sourceLocale;
    const text = useMemo(() => format(template, values, locale), [template, values, locale]);

    return <>{text}</>;
  };

  const createFormatComponent: InlineTranslator<FD>['format'] = (template, ...[values]) => {
    return <FormatComponent {...{ template, values: values as any }} />;
  };

  const RenderComponent = ({ renderFn, dependecies = [renderFn] }: { renderFn: (locale: string) => ReactNode; dependecies?: any[] }) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = contextLocale ?? sourceLocale;
    const value = useMemo(() => renderFn(locale), [locale, ...dependecies]);
    return <>{value}</>;
  };

  const createRenderComponent: InlineTranslator<FD>['render'] = (renderFn, dependecies) => {
    return <RenderComponent renderFn={renderFn} dependecies={dependecies} />;
  };

  const t: InlineTranslator<FD> = Object.assign<
    TranslatorFn<FD, InlineTranslatorOptions, ReactNode>,
    Omit<InlineTranslator<FD>, keyof TranslatorFn<FD, InlineTranslatorOptions, ReactNode>>
  >(createTranslatorComponent, {
    get locale() {
      return createRenderComponent((locale) => locale, []);
    },

    unknown: createTranslatorComponent as InlineTranslator<FD>['unknown'],

    format: createFormatComponent,

    render: createRenderComponent,

    dateTimeFormat(date, options) {
      return createRenderComponent(
        (locale) => store.cache.get(Intl.DateTimeFormat, locale, options).format(toDate(date)),
        [date, hash(options)],
      );
    },

    displayNames(code, options) {
      // TODO remove cast when DisplayNames is included in standard lib
      return createRenderComponent(
        (locale) => store.cache.get((Intl as any).DisplayNames, locale, options).of(code),
        [code, hash(options)],
      );
    },

    listFormat(list, options) {
      // TODO remove cast when DisplayNames is included in standard lib
      return createRenderComponent(
        (locale) => store.cache.get((Intl as any).ListFormat, locale, options).format(list),
        [list && hash([...list]), hash(options)],
      );
    },

    numberFormat(number, options) {
      return createRenderComponent((locale) => store.cache.get(Intl.NumberFormat, locale, options).format(number), [number, hash(options)]);
    },

    pluralRules(number, options) {
      return createRenderComponent((locale) => store.cache.get(Intl.PluralRules, locale, options).select(number), [number, hash(options)]);
    },

    relativeTimeFormat(value, unit, options) {
      return createRenderComponent(
        (locale) => store.cache.get(Intl.RelativeTimeFormat, locale, options).format(value, unit),
        [value, unit, hash(options)],
      );
    },
  });

  return {
    getTranslator: createGetTranslator(store, options),
    useTranslator,
    t,

    clearDicts() {
      store.clear();
    },
  };
}
