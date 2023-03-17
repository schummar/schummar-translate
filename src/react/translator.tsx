import React, { Fragment, ReactNode, useContext, useMemo } from 'react';
import { TranslationContext } from '.';
import { TranslatorFn } from '..';
import { hash } from '../cache';
import { calcLocales, castArray, toDate } from '../helpers';
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
  const {
    sourceLocale,
    fallbackLocale,
    fallbackToLessSpecific = true,
    fallback: defaultFallback,
    placeholder: defaultPlaceholder,
    warn,
    dateTimeFormatOptions,
    displayNamesOptions,
    listFormatOptions,
    numberFormatOptions,
    pluralRulesOptions,
    relativeTimeFormatOptions,
    ignoreMissingArgs,
  } = options;

  /////////////////////////////////////////////////////////////////////////////
  // hook translator
  /////////////////////////////////////////////////////////////////////////////
  const useTranslator: ReactCreateTranslatorResult<FD>['useTranslator'] = (overrideLocale) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;
    const dicts = useStore(store, locale, ...calcLocales(locale, fallbackToLessSpecific, fallbackLocale));
    const [sourceDict] = useStore(store, sourceLocale);

    return useMemo(() => {
      const t: TranslatorFn<FD, HookTranslatorOptions, string> = (id, ...[values, options]) => {
        const fallback = options?.fallback ?? defaultFallback;
        const placeholder = options?.placeholder ?? defaultPlaceholder;
        return translate({
          dicts,
          sourceDict,
          id,
          values,
          fallback,
          placeholder,
          locale,
          warn,
          cache: store.cache,
          ignoreMissingArgs,
        }) as any;
      };

      return Object.assign<TranslatorFn<FD>, Omit<HookTranslator<FD>, keyof TranslatorFn<FD>>>(t, {
        locale,

        unknown: t as HookTranslator<FD>['unknown'],

        format(template, ...[values]) {
          return format({ template, values: values as any, locale, cache: store.cache });
        },

        dateTimeFormat(date, options = dateTimeFormatOptions) {
          return store.cache.get(Intl.DateTimeFormat, locale, options).format(toDate(date));
        },

        displayNames(code, options = displayNamesOptions) {
          // TODO remove cast when DisplayNames is included in standard lib
          return store.cache.get((Intl as any).DisplayNames, locale, options).of(code);
        },

        listFormat(list, options = listFormatOptions) {
          // TODO remove cast when DisplayNames is included in standard lib
          return store.cache.get((Intl as any).ListFormat, locale, options).format(list);
        },

        numberFormat(number, options = numberFormatOptions) {
          return store.cache.get(Intl.NumberFormat, locale, options).format(number);
        },

        pluralRules(number, options = pluralRulesOptions) {
          return store.cache.get(Intl.PluralRules, locale, options).select(number);
        },

        relativeTimeFormat(value, unit, options = relativeTimeFormatOptions) {
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
    const dicts = useStore(store, locale, ...calcLocales(locale, fallbackToLessSpecific, fallbackLocale));
    const [sourceDict] = useStore(store, sourceLocale);

    const fallback = options?.fallback ?? defaultFallback;
    const placeholder = options?.placeholder ?? defaultPlaceholder;

    const text = useMemo(
      () => translate({ dicts, sourceDict, id, values, fallback, placeholder, locale, warn, cache: store.cache, ignoreMissingArgs }),
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

  const RenderComponent = ({
    renderFn,
    dependecies = [renderFn],
  }: {
    renderFn: (t: HookTranslator<FD>) => ReactNode;
    dependecies?: any[];
  }) => {
    const t = useTranslator();
    const value = useMemo(() => renderFn(t), [t, ...dependecies]);
    return <>{value}</>;
  };

  const render: InlineTranslator<FD>['render'] = (renderFn, dependecies) => {
    return <RenderComponent renderFn={renderFn} dependecies={dependecies} />;
  };

  const t: InlineTranslator<FD> = Object.assign<
    TranslatorFn<FD, InlineTranslatorOptions, ReactNode>,
    Omit<InlineTranslator<FD>, keyof TranslatorFn<FD, InlineTranslatorOptions, ReactNode>>
  >(createTranslatorComponent, {
    locale: render((t) => t.locale, []),

    unknown: createTranslatorComponent as InlineTranslator<FD>['unknown'],

    format(template, ...[values]) {
      return render((t) => format({ template, values: values as any, locale: t.locale, cache: store.cache }), [template, hash(values)]);
    },

    render,

    dateTimeFormat(date, options = dateTimeFormatOptions) {
      return render((t) => store.cache.get(Intl.DateTimeFormat, t.locale, options).format(toDate(date)), [date, hash(options)]);
    },

    displayNames(code, options = displayNamesOptions) {
      // TODO remove cast when DisplayNames is included in standard lib
      return render((t) => store.cache.get((Intl as any).DisplayNames, t.locale, options).of(code), [code, hash(options)]);
    },

    listFormat(list, options = listFormatOptions) {
      // TODO remove cast when DisplayNames is included in standard lib
      return render(
        (t) => store.cache.get((Intl as any).ListFormat, t.locale, options).format(list),
        [list && hash([...list]), hash(options)],
      );
    },

    numberFormat(number, options = numberFormatOptions) {
      return render((t) => store.cache.get(Intl.NumberFormat, t.locale, options).format(number), [number, hash(options)]);
    },

    pluralRules(number, options = pluralRulesOptions) {
      return render((t) => store.cache.get(Intl.PluralRules, t.locale, options).select(number), [number, hash(options)]);
    },

    relativeTimeFormat(value, unit, options = relativeTimeFormatOptions) {
      return render((t) => store.cache.get(Intl.RelativeTimeFormat, t.locale, options).format(value, unit), [value, unit, hash(options)]);
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
