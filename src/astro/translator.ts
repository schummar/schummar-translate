import { TranslatorFn } from '..';
import { calcLocales, castArray } from '../helpers';
import { intlHelpers } from '../intlHelpers';
import { resolveProvidedArgs } from '../resolveProvidedArgs';
import { Store } from '../store';
import { format, translate } from '../translate';
import { Dict, FlatDict, FlattenDict, Translator } from '../types';
import { AstroCreateTranslatorOptions, AstroCreateTranslatorResult, InlineTranslator, InlineTranslatorOptions } from './types';

export function createTranslator<D extends Dict, ProvidedArgs extends string = never>(
  options: AstroCreateTranslatorOptions<D, ProvidedArgs>,
): AstroCreateTranslatorResult<FlattenDict<D>, ProvidedArgs> {
  type FD = FlattenDict<D>;

  const {
    sourceLocale,
    fallbackLocale,
    fallbackToLessSpecific = true,
    fallback: defaultFallback,
    fallbackIgnoresFallbackLocales = false,
    warn,
    dateTimeFormatOptions,
    listFormatOptions,
    numberFormatOptions,
    pluralRulesOptions,
    relativeTimeFormatOptions,
    ignoreMissingArgs,
    provideArgs,
  } = options;

  const store = new Store<D, ProvidedArgs>(options as any);
  const providedArgs = resolveProvidedArgs(provideArgs);

  function getTranslator(locale: string) {
    const dicts = store.loadAll(locale, ...calcLocales(locale, fallbackToLessSpecific, fallbackLocale)) as FlatDict[];
    const sourceDict = store.load(sourceLocale) as FlatDict;

    const t: TranslatorFn<FD, ProvidedArgs> = (id, ...[values, options]) => {
      const fallback = options?.fallback ?? defaultFallback;

      return translate({
        dicts,
        sourceDict,
        id,
        values,
        fallback,
        fallbackIgnoresFallbackLocales,
        locale,
        warn,
        cache: store.cache,
        ignoreMissingArgs,
        providedArgs,
      }) as any;
    };

    return Object.assign<TranslatorFn<FD, ProvidedArgs>, Omit<Translator<FD, ProvidedArgs>, keyof TranslatorFn<FD, ProvidedArgs>>>(t, {
      locale,

      unknown: t as Translator<FD, ProvidedArgs>['unknown'],
      dynamic: t as Translator<FD, ProvidedArgs>['dynamic'],

      format(template, ...[values]) {
        return format({
          template,
          values: values as any,
          locale,
          cache: store.cache,
          ignoreMissingArgs,
          providedArgs: resolveProvidedArgs(provideArgs),
        });
      },

      ...intlHelpers({
        cache: store.cache,
        transform: (fn) => fn(locale),
        dateTimeFormatOptions,
        listFormatOptions,
        numberFormatOptions,
        pluralRulesOptions,
        relativeTimeFormatOptions,
      }),
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  // inline translator
  /////////////////////////////////////////////////////////////////////////////

  const createTranslatorComponent: TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, JSX.Element> = (id, ...[values, options]) => {
    const locale = options?.locale ?? globalThis.__lang__ ?? sourceLocale;
    const t = getTranslator(locale);
    const text = t(id, ...([values, options] as any));
    const textArray = castArray(text);
    const Component = options?.component ?? 'Fragment';

    return (
      <>
        {textArray.map((line) => (
          <Component>{line}</Component>
        ))}
      </>
    );
  };

  const render: InlineTranslator<FD, ProvidedArgs>['render'] = (renderFn) => {
    
      const locale = globalThis.__lang__ ?? sourceLocale;
      const t = getTranslator(locale);

      return <>{renderFn(t, { providedArgs: providedArgs as any })}</>;
  
  };

  const t: InlineTranslator<FD, ProvidedArgs> = Object.assign<
    TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, JSX.Element>,
    Omit<InlineTranslator<FD, ProvidedArgs>, keyof TranslatorFn<FD, ProvidedArgs, InlineTranslatorOptions, JSX.Element>>
  >(createTranslatorComponent, {
    locale: render((t) => t.locale),

    unknown: createTranslatorComponent as InlineTranslator<FD>['unknown'],
    dynamic: createTranslatorComponent as InlineTranslator<FD>['dynamic'],

    format(template, ...[values]) {
      return render((t, { providedArgs }) =>
        format({
          template,
          values: values as any,
          locale: t.locale,
          cache: store.cache,
          ignoreMissingArgs,
          providedArgs,
        }),
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
    getTranslator,
    t,

    clearDicts() {
      store.clear();
    },
  };
}
