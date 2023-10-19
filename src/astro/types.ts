import { CreateTranslatorResult } from '..';
import { CreateTranslatorOptions, Dict, FlatDict, Flatten, ICUArgument, ICUDateArgument, IsNever, Translator } from '../types';

export type AstroCreateTranslatorOptions<D extends Dict, ProvidedArgs extends string = never> = Flatten<
  Omit<CreateTranslatorOptions<D, ProvidedArgs>, 'dicts' | 'provideArgs'> & {
    dicts?: { [locale: string]: Dict | (() => Dict) } | ((locale: string) => Dict | null);
  } & (IsNever<ProvidedArgs> extends true
      ? { provideArgs?: Record<string, never> }
      : {
          provideArgs: Record<ProvidedArgs, ICUArgument | ICUDateArgument>;
        })
>;

export interface AstroCreateTranslatorResult<D extends FlatDict, ProvidedArgs extends string = never>
  extends Omit<CreateTranslatorResult<D, ProvidedArgs>, 'getTranslator'> {
  getTranslator: (locale: string) => Translator<D, ProvidedArgs>;
  /** Returns an inline translator instance, which updates as locales changes or dictionaries are loaded */
  t: InlineTranslator<D, ProvidedArgs>;
}

export interface InlineTranslatorOptions {
  /** Override locale */
  locale?: string;
  /** Override fallback to use if string is not available in active locale */
  fallback?: JSX.Element;
  /** Wrap string (or each line in case of array values) in the given component */
  component?: JSX.ElementType;
}

export interface InlineTranslator<D extends FlatDict, ProvidedArgs extends string = never>
  extends Translator<D, ProvidedArgs, InlineTranslatorOptions, JSX.Element> {
  /** Render something using the currently active locale
   * @param renderFn your custom render function
   */
  render(
    renderFn: (
      t: Translator<D, ProvidedArgs>,
      context: {
        providedArgs: Record<ProvidedArgs, ICUArgument | ICUDateArgument>;
      },
    ) => JSX.Element | string | number | Iterable<JSX.Element> | boolean | null | undefined,
  ): JSX.Element;
}
