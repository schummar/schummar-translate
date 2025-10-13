import { ElementType, ReactNode } from 'react';
import { CreateTranslatorOptions, Dict, FlatDict, Translator, type FlattenDict } from '../types';

export type ReactCreateTranslatorOptions<D extends Dict, ProvidedArgs extends string = never> = CreateTranslatorOptions<D, ProvidedArgs> & {
  /** Display while a locale is loading */
  placeholder?: string | ((id: string, sourceTranslation?: string | readonly string[]) => string);
};

export interface ReactCreateTranslatorResult<D extends Dict, FD extends FlatDict = FlattenDict<D>, ProvidedArgs extends string = never> {
  /** Returns a translator instance in a hook, which updates as locales changes or dictionaries are loaded */
  useTranslator(locale?: string): HookTranslator<D, FD, ProvidedArgs>;

  /** Returns a function that can be used to get a translator instance for a specific locale */
  useGetTranslator(): (locale: string) => Promise<Translator<FD, ProvidedArgs>>;

  /** Returns an inline translator instance, which updates as locales changes or dictionaries are loaded */
  t: InlineTranslator<D, FD, ProvidedArgs>;

  /** Returns a promise for a translator instance for a specific locale. Note that this translators options are influenced by the top most TranslationContextProvider */
  getTranslator(locale: string): Promise<Translator<FD, ProvidedArgs>>;

  /** Provide current locale and translation options for nested components */
  TranslationContextProvider: (props: {
    locale?: string;
    options?: Partial<ReactCreateTranslatorOptions<FD, ProvidedArgs>>;
    children?: ReactNode;
  }) => JSX.Element;
}

export interface HookTranslatorOptions {
  /** Override fallback to use if string is not available in active locale */
  fallback?: string;
  /** Override placholder that is displayed while a locale is loading */
  placeholder?: string;
}

export interface HookTranslator<D extends Dict, FD extends FlatDict = FlattenDict<D>, ProvidedArgs extends string = never>
  extends Translator<FD, ProvidedArgs, HookTranslatorOptions, string> {
  /** Current options */
  options: ReactCreateTranslatorOptions<D, ProvidedArgs>;

  /** Clear all dictionary data. As needed the dictionaries will be reloaded. Useful for OTA translation updates. */
  clearDicts(): void;
}

export interface InlineTranslatorOptions {
  /** Override locale */
  locale?: string;
  /** Override fallback to use if string is not available in active locale */
  fallback?: ReactNode;
  /** Override placholder that is displayed while a locale is loading */
  placeholder?: ReactNode;
  /** Wrap string (or each line in case of array values) in the given component */
  component?: ElementType;
}

export interface InlineTranslator<D extends Dict, FD extends FlatDict = FlattenDict<D>, ProvidedArgs extends string = never>
  extends Translator<FD, ProvidedArgs, InlineTranslatorOptions, ReactNode> {
  /** Render something using the currently active locale
   * @param renderFn your custom render function
   * @param dependencies if provided, will memoize the result of renderFn as long as dependencies stay the same (shallow compare)
   */
  render(renderFn: (t: HookTranslator<D, FD, ProvidedArgs>) => ReactNode, dependencies?: any[]): ReactNode;
}
