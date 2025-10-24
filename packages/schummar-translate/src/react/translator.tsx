import { createContext, Fragment, ReactNode, useContext, useEffect, useMemo, type Context } from 'react';
import { TranslatorFn } from '..';
import { hash } from '../cache';
import defaultOptions from '../defaultOptions';
import getKeys from '../getKeys';
import { castArray, getPossibleLocales } from '../helpers';
import { intlHelpers } from '../intlHelpers';
import { Store } from '../store';
import { format, translate } from '../translate';
import { getTranslator } from '../translator';
import { Dict, FlattenDict } from '../types';
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
  originalOptions: ReactCreateTranslatorOptions<D, ProvidedArgs>,
): ReactCreateTranslatorResult<D, FlattenDict<D>, ProvidedArgs> {
  type FD = FlattenDict<D>;
  type TContext = typeof TranslationContext extends Context<infer T> ? T : never;

  let globalOptions = defaultOptions(originalOptions);
  let globalStore = new Store(originalOptions);

  const TranslationContext = createContext<{
    locale: string;
    options: ReactCreateTranslatorOptions<D, ProvidedArgs>;
    store: Store<D, FD, ProvidedArgs>;
    depth: number;
  }>({
    locale: originalOptions.sourceLocale,
    options: globalOptions,
    store: globalStore,
    depth: 0,
  });

  /////////////////////////////////////////////////////////////////////////////
  // hook translator
  /////////////////////////////////////////////////////////////////////////////

  const useTranslator: ReactCreateTranslatorResult<D, FD, ProvidedArgs>['useTranslator'] = (overrideLocale) => {
    const { locale: contextLocale, options, store } = useContext(TranslationContext);
    const locale = overrideLocale ?? contextLocale;
    const [sourceDict] = useStore(store, options.sourceLocale);
    const dicts = useStore(store, ...getPossibleLocales(locale, options));

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
          cache: store.cache,
          ignoreMissingArgs: options.ignoreMissingArgs,
          providedArgs: options.provideArgs,
        }) as any;
      };

      return Object.assign<typeof t, Omit<HookTranslator<D, FD, ProvidedArgs>, keyof typeof t>>(t, {
        locale,

        unknown: t as HookTranslator<D, FD, ProvidedArgs>['unknown'],
        dynamic: t as any,

        keys: getKeys(sourceDict),

        format(template, ...[values]) {
          return format({
            template,
            values: values as any,
            locale,
            cache: store.cache,
            ignoreMissingArgs: options.ignoreMissingArgs,
            providedArgs: options.provideArgs,
          });
        },

        ...intlHelpers((fn) => fn(locale, store.cache, options)),

        clearDicts() {
          store.clear();
        },

        options,
      });
    }, [options, locale, store, sourceDict, dicts]);
  };

  const useGetTranslator: ReactCreateTranslatorResult<D, FD, ProvidedArgs>['useGetTranslator'] = () => {
    const { options, store } = useContext(TranslationContext);

    return (locale: string) => {
      return getTranslator(store, options, locale);
    };
  };

  /////////////////////////////////////////////////////////////////////////////
  // inline translator
  /////////////////////////////////////////////////////////////////////////////

  const InternalRenderComponent = ({
    render,
    dependecies = [render],
  }: {
    render(t: HookTranslator<D, FD, ProvidedArgs>, context: TContext): ReactNode;
    dependecies?: any[];
  }) => {
    const t = useTranslator();
    const context = useContext(TranslationContext);

    const value = useMemo(() => render(t, context), [t, context, ...dependecies]);
    return <>{value}</>;
  };

  const RenderComponent = ({
    render,
    dependecies = [render],
  }: {
    render(t: HookTranslator<D, FD, ProvidedArgs>): ReactNode;
    dependecies?: any[];
  }) => {
    const t = useTranslator();

    const value = useMemo(() => render(t), [t, ...dependecies]);
    return <>{value}</>;
  };

  const elementTranslate: TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, ReactNode> = (id, ...[values, options]) => {
    return (
      <InternalRenderComponent
        render={(t) => {
          const text = t(id, ...([values, options] as any));
          const textArray = castArray(text);
          const Component = options?.component ?? Fragment;

          return (
            <>
              {textArray.map((line, index) => (
                <Component key={index}>{line}</Component>
              ))}
            </>
          );
        }}
        dependecies={[id, values, options]}
      />
    );
  };

  const t: InlineTranslator<D, FD, ProvidedArgs> = Object.assign<
    typeof elementTranslate,
    Omit<InlineTranslator<D, FD, ProvidedArgs>, keyof typeof elementTranslate>
  >(elementTranslate, {
    unknown: elementTranslate as any,
    dynamic: elementTranslate as any,

    locale: <InternalRenderComponent render={(t) => t.locale} dependecies={[]} />,

    keys(prefix?: any) {
      return <InternalRenderComponent render={(t) => t.keys(prefix)} dependecies={[prefix]} />;
    },

    format(template, ...[values]) {
      return (
        <InternalRenderComponent
          render={(t, { options, store }) =>
            format({
              template,
              values: values as Record<string, unknown> | undefined,
              locale: t.locale,
              cache: store.cache,
              ignoreMissingArgs: options.ignoreMissingArgs,
              providedArgs: options.provideArgs,
            })
          }
          dependecies={[template, hash(values)]}
        />
      );
    },

    render(fn, deps) {
      return <RenderComponent render={fn} dependecies={deps} />;
    },

    ...intlHelpers((fn) => {
      return <InternalRenderComponent render={(t, { options, store }) => fn(t.locale, store.cache, options)} />;
    }),
  });

  const TranslationContextProvider: ReactCreateTranslatorResult<D, FD, ProvidedArgs>['TranslationContextProvider'] = ({
    locale: newLocale,
    options: newOptions,
    children,
  }) => {
    const parentContext = useContext(TranslationContext);
    const locale = newLocale ?? parentContext.locale;
    const depth = parentContext.depth + 1;
    const options = newOptions ? defaultOptions({ ...parentContext.options, ...newOptions }) : parentContext.options;

    const sourceDictionaryHash = useMemo(
      () => newOptions?.sourceDictionary && hash(newOptions.sourceDictionary),
      [newOptions?.sourceDictionary],
    );
    const cacheOptionsHash = useMemo(() => newOptions?.cacheOptions && hash(newOptions.cacheOptions), [newOptions?.cacheOptions]);

    let store = useMemo(() => {
      if (
        (!newOptions?.sourceLocale || newOptions.sourceLocale === parentContext.options.sourceLocale) &&
        (!sourceDictionaryHash || sourceDictionaryHash === hash(parentContext.options.sourceDictionary)) &&
        (!newOptions?.dicts || newOptions.dicts === parentContext.options.dicts) &&
        (!cacheOptionsHash || cacheOptionsHash === hash(parentContext.options.cacheOptions))
      ) {
        return parentContext.store;
      }

      return new Store<D, FD, ProvidedArgs>(options);
    }, [newOptions?.sourceLocale, sourceDictionaryHash, newOptions?.dicts, cacheOptionsHash]);

    useEffect(() => {
      if (depth === 1) {
        globalOptions = options;
        globalStore = store;
      }
    });

    return (
      <TranslationContext.Provider
        value={{
          locale,
          options,
          store,
          depth,
        }}
      >
        {children}
      </TranslationContext.Provider>
    );
  };

  return {
    useTranslator,
    useGetTranslator,
    t,
    getTranslator: (locale: string) => getTranslator(globalStore, globalOptions, locale),
    TranslationContextProvider,
  };
}
