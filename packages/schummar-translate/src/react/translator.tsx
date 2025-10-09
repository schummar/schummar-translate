import { createContext, Fragment, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { TranslatorFn } from '..';
import { hash } from '../cache';
import defaultOptions from '../defaultOptions';
import getKeys from '../getKeys';
import { castArray, getPossibleLocales, objEquals } from '../helpers';
import { intlHelpers } from '../intlHelpers';
import { resolveProvidedArgs } from '../resolveProvidedArgs';
import { Store } from '../store';
import { format, translate } from '../translate';
import { getTranslator } from '../translator';
import { Dict, FlattenDict, ICUArgument, ICUDateArgument, Values } from '../types';
import { Observable, useObservable } from './observable';
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
  _options: ReactCreateTranslatorOptions<D, ProvidedArgs>,
): ReactCreateTranslatorResult<FlattenDict<D>, ProvidedArgs> {
  type FD = FlattenDict<D>;

  const options = new Observable(defaultOptions(_options));
  const store = new Observable(new Store<D, ProvidedArgs>(options.value));

  const TranslationContext = createContext<{ locale?: string; options?: Partial<ReactCreateTranslatorOptions<D, ProvidedArgs>> }>({});

  function useOptions(): ReactCreateTranslatorOptions<D, ProvidedArgs> {
    const globalOptions = useObservable(options);
    const contextOptions = useContext(TranslationContext).options;
    return { ...globalOptions, ...contextOptions };
  }

  function useProvidedArgs() {
    const { provideArgs } = useOptions();
    const [args, setArgs] = useState(resolveProvidedArgs(provideArgs));

    useEffect(() => {
      const handles: (() => void)[] = [];
      let currentArgs = args;

      function update() {
        const newArgs = resolveProvidedArgs(provideArgs);
        if (!objEquals(newArgs, currentArgs)) {
          setArgs(newArgs);
        }
      }
      update();

      for (const [, value] of Object.entries(provideArgs ?? {})) {
        if (typeof value === 'object' && value !== null && 'subscribe' in value) {
          const handle = (value as any).subscribe(update);
          handles.push(handle);
        }
      }

      return () => {
        for (const handle of handles) {
          handle();
        }
      };
    }, [provideArgs]);

    return args;
  }

  /////////////////////////////////////////////////////////////////////////////
  // hook translator
  /////////////////////////////////////////////////////////////////////////////
  const useTranslator: ReactCreateTranslatorResult<FD, ProvidedArgs>['useTranslator'] = (overrideLocale) => {
    const options = useOptions();
    const contextLocale = useContext(TranslationContext).locale;
    const locale = overrideLocale ?? contextLocale ?? options.sourceLocale;

    const _store = useObservable(store);
    const sourceDict = _store.load(options.sourceLocale) as FD;
    const dicts = useStore(_store, locale, ...getPossibleLocales(locale, options));
    const providedArgs = useProvidedArgs();

    return useMemo(() => {
      const t: TranslatorFn<FD, ProvidedArgs, HookTranslatorOptions, string> = (id, ...[values, translateOptions]) => {
        const fallback = translateOptions?.fallback ?? options.fallback;
        const placeholder = translateOptions?.placeholder ?? options.placeholder;
        return translate({
          dicts,
          sourceDict,
          id,
          values,
          fallback,
          fallbackIgnoresFallbackLocales: options.fallbackIgnoresFallbackLocales,
          placeholder,
          locale,
          warn: options.warn,
          cache: _store.cache,
          ignoreMissingArgs: options.ignoreMissingArgs,
          providedArgs,
        }) as any;
      };

      return Object.assign<TranslatorFn<FD, ProvidedArgs>, Omit<HookTranslator<FD, ProvidedArgs>, keyof TranslatorFn<FD, ProvidedArgs>>>(
        t,
        {
          locale,

          unknown: t as HookTranslator<FD>['unknown'],
          dynamic: t as any,

          keys: getKeys(sourceDict as FD),

          format(template, ...[values]) {
            return format({
              template,
              values: values as any,
              locale,
              cache: _store.cache,
              ignoreMissingArgs: options.ignoreMissingArgs,
              providedArgs,
            });
          },

          ...intlHelpers({
            cache: _store.cache,
            transform: (fn) => fn(locale),
            dateTimeFormatOptions: options.dateTimeFormatOptions,
            listFormatOptions: options.listFormatOptions,
          }),
        },
      );
    }, [options, locale, _store, sourceDict, dicts, providedArgs]);
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
    // const option = useOptions();
    // const contextLocale = useContext(TranslationContext).locale;
    // const locale = options?.locale ?? contextLocale ?? sourceLocale;
    // const sourceDict = getSourceDict();
    // const dicts = useStore(
    //   store,
    //   locale,
    //   ...getPossibleLocales(locale, { fallbackToLessSpecific, fallbackToMoreSpecific, fallback: fallbackLocale }),
    // );
    // const providedArgs = useProvidedArgs();

    // const fallback = options?.fallback ?? defaultFallback;
    // const placeholder = options?.placeholder ?? defaultPlaceholder;

    // const text = useMemo(
    //   () =>
    //     translate({
    //       dicts,
    //       sourceDict,
    //       id,
    //       values,
    //       fallback,
    //       fallbackIgnoresFallbackLocales,
    //       placeholder,
    //       locale,
    //       warn,
    //       cache: store.cache,
    //       ignoreMissingArgs,
    //       providedArgs,
    //     }),
    //   [locale, dicts, providedArgs, id, values, fallback, placeholder],
    // );
    const text = useTranslator()(id, values, options);
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
    renderFn: Parameters<InlineTranslator<FD, ProvidedArgs>['render']>[0];
    dependecies?: any[];
  }) => {
    const t = useTranslator();
    const options = useOptions();
    const providedArgs = useProvidedArgs();
    const _store = useObservable(store);

    const value = useMemo(
      () =>
        renderFn(t, {
          options,
          providedArgs: providedArgs as Record<ProvidedArgs, ICUArgument | ICUDateArgument>,
          store: store,
        }),
      [t, providedArgs, _store, ...dependecies],
    );
    return <>{value}</>;
  };

  const render: InlineTranslator<FD, ProvidedArgs>['render'] = (renderFn, dependecies) => {
    return <RenderComponent renderFn={renderFn} dependecies={dependecies} />;
  };

  const t: InlineTranslator<FD, ProvidedArgs> = Object.assign<
    TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, ReactNode>,
    Omit<InlineTranslator<FD, ProvidedArgs>, keyof TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, ReactNode>>
  >(createTranslatorComponent, {
    locale: render((t) => t.locale, []),

    unknown: createTranslatorComponent as InlineTranslator<FD>['unknown'],
    dynamic: createTranslatorComponent as any,

    keys: getKeys(() => store.value.load(options.value.sourceLocale) as FD),

    format(template, ...[values]) {
      return render(
        (t, { options, providedArgs, store }) =>
          format({
            template,
            values: values as any,
            locale: t.locale,
            cache: store.cache,
            ignoreMissingArgs: options.ignoreMissingArgs,
            providedArgs,
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

  const TranslationContextProvider = ({
    locale,
    options,
    children,
  }: {
    locale?: string;
    options?: ReactCreateTranslatorOptions<D, ProvidedArgs>;
    children?: React.ReactNode;
  }): JSX.Element => {
    const value = useMemo(() => ({ locale }), [locale]);
    return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
  };

  return {
    getTranslator: getTranslator(store, options),
    useTranslator,
    t,
    TranslationContextProvider,

    clearDicts() {
      store.clear();
    },

    updateOptions(newOptions) {
      options = defaultOptions({ ...options, ...newOptions });
      store = new Store<D, ProvidedArgs>(options);
      _sourceDict = undefined;
    },
  };
}
