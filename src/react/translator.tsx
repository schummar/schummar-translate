import { Fragment, ReactNode, useContext, useMemo } from 'react';
import { TranslationContext } from '.';
import { TranslatorFn } from '..';
import { hash } from '../cache';
import { calcLocales, castArray } from '../helpers';
import { intlHelpers } from '../intlHelpers';
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

export function createTranslator<D extends Dict, ProvidedArgs extends string = never>(
  options: ReactCreateTranslatorOptions<D, ProvidedArgs>,
): ReactCreateTranslatorResult<FlattenDict<D>, ProvidedArgs> {
  type FD = FlattenDict<D>;

  const store = new Store<D, ProvidedArgs>(options);
  const {
    sourceLocale,
    fallbackLocale,
    fallbackToLessSpecific = true,
    fallback: defaultFallback,
    placeholder: defaultPlaceholder,
    warn,
    dateTimeFormatOptions,
    listFormatOptions,
    numberFormatOptions,
    pluralRulesOptions,
    relativeTimeFormatOptions,
    ignoreMissingArgs,
    provideArgs,
  } = options;

  /////////////////////////////////////////////////////////////////////////////
  // hook translator
  /////////////////////////////////////////////////////////////////////////////
  const useTranslator: ReactCreateTranslatorResult<FD, ProvidedArgs>['useTranslator'] = (overrideLocale) => {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? sourceLocale;
    const dicts = useStore(store, locale, ...calcLocales(locale, fallbackToLessSpecific, fallbackLocale));
    const [sourceDict] = useStore(store, sourceLocale);

    return useMemo(() => {
      const t: TranslatorFn<FD, ProvidedArgs, HookTranslatorOptions, string> = (id, ...[values, options]) => {
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
          provideArgs,
        }) as any;
      };

      return Object.assign<TranslatorFn<FD, ProvidedArgs>, Omit<HookTranslator<FD, ProvidedArgs>, keyof TranslatorFn<FD, ProvidedArgs>>>(
        t,
        {
          locale,

          unknown: t as HookTranslator<FD>['unknown'],
          dynamic: t as HookTranslator<FD>['dynamic'],

          format(template, ...[values]) {
            return format({
              template,
              values: values as any,
              locale,
              cache: store.cache,
              ignoreMissingArgs,
              provideArgs,
            });
          },

          ...intlHelpers({
            cache: store.cache,
            transform: (fn) => fn(locale),
            dateTimeFormatOptions,
            listFormatOptions,
          }),
        },
      );
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
    values: Values<FD[K], ProvidedArgs, InlineTranslatorOptions>[0];
    options?: Values<FD[K], ProvidedArgs, InlineTranslatorOptions>[1];
  }) {
    const contextLocale = useContext(TranslationContext).locale;
    const locale = options?.locale ?? contextLocale ?? sourceLocale;
    const dicts = useStore(store, locale, ...calcLocales(locale, fallbackToLessSpecific, fallbackLocale));
    const [sourceDict] = useStore(store, sourceLocale);

    const fallback = options?.fallback ?? defaultFallback;
    const placeholder = options?.placeholder ?? defaultPlaceholder;

    const text = useMemo(
      () =>
        translate({
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
          provideArgs,
        }),
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

  const createTranslatorComponent: TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, ReactNode> = (id, ...[values, options]) => {
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

  const t: InlineTranslator<FD, ProvidedArgs> = Object.assign<
    TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, ReactNode>,
    Omit<InlineTranslator<FD, ProvidedArgs>, keyof TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, ReactNode>>
  >(createTranslatorComponent, {
    locale: render((t) => t.locale, []),

    unknown: createTranslatorComponent as InlineTranslator<FD>['unknown'],
    dynamic: createTranslatorComponent as InlineTranslator<FD>['dynamic'],

    format(template, ...[values]) {
      return render(
        (t) =>
          format({
            template,
            values: values as any,
            locale: t.locale,
            cache: store.cache,
            ignoreMissingArgs,
            provideArgs,
          }),
        [template, hash(values)],
      );
    },

    render,

    ...intlHelpers({
      cache: store.cache,
      transform: (fn) => render((t) => fn(t.locale)),
      dateTimeFormatOptions,
      listFormatOptions,
      numberFormatOptions,
      pluralRulesOptions,
      relativeTimeFormatOptions,
    }),
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
