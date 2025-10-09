import { ElementType, ReactNode } from 'react';
import { CreateTranslatorResult } from '..';
import { CreateTranslatorOptions, Dict, FlatDict, ICUArgument, ICUDateArgument, Translator } from '../types';

export type ReactCreateTranslatorOptions<D extends Dict, ProvidedArgs extends string = never> = CreateTranslatorOptions<D, ProvidedArgs> & {
  /** Display while a locale is loading */
  placeholder?: string | ((id: string, sourceTranslation?: string | readonly string[]) => string);
};

export interface ReactCreateTranslatorResult<D extends FlatDict, ProvidedArgs extends string = never>
  extends CreateTranslatorResult<D, ProvidedArgs> {
  /** Returns a translator instance in a hook, which updates as locales changes or dictionaries are loaded */
  useTranslator(locale?: string): HookTranslator<D, ProvidedArgs>;

  /** Returns an inline translator instance, which updates as locales changes or dictionaries are loaded */
  t: InlineTranslator<D, ProvidedArgs>;

  TranslationContextProvider: (props: {
    locale?: string;
    options?: Partial<ReactCreateTranslatorOptions<D, ProvidedArgs>>;
    children?: ReactNode;
  }) => JSX.Element;

  updateOptions(newOptions: Partial<ReactCreateTranslatorOptions<any, ProvidedArgs>>): void;
}

export interface HookTranslatorOptions {
  /** Override fallback to use if string is not available in active locale */
  fallback?: string;
  /** Override placholder that is displayed while a locale is loading */
  placeholder?: string;
}

export interface HookTranslator<D extends FlatDict, ProvidedArgs extends string = never, Options = HookTranslatorOptions, Output = string>
  extends Translator<D, ProvidedArgs, Options, Output> {}

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

export interface InlineTranslator<D extends FlatDict, ProvidedArgs extends string = never>
  extends HookTranslator<D, ProvidedArgs, InlineTranslatorOptions, ReactNode> {
  /** Render something using the currently active locale
   * @param renderFn your custom render function
   * @param dependencies if provided, will memoize the result of renderFn as long as dependencies stay the same (shallow compare)
   */
  render(
    renderFn: (
      t: HookTranslator<D, ProvidedArgs>,
      context: {
        providedArgs: Record<ProvidedArgs, ICUArgument | ICUDateArgument>;
      },
    ) => ReactNode,
    dependencies?: any[],
  ): ReactNode;
}
