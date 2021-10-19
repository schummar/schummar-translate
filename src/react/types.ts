import { ElementType, ReactNode } from 'react';
import { CreateTranslatorResult } from '..';
import { CreateTranslatorOptions, Dict, FlatDict, Translator } from '../types';

export interface ReactCreateTranslatorOptions<D extends Dict> extends CreateTranslatorOptions<D> {
  /** Display while a locale is loading */
  placeholder?: string | ((id: string) => string);
}

export interface ReactCreateTranslatorResult<D extends FlatDict> extends CreateTranslatorResult<D> {
  /** Returns a translator instance in a hook, which updates as locales changes or dictionaries are loaded */
  useTranslator: (locale?: string) => HookTranslator<D>;
  /** Returns an inline translator instance, which updates as locales changes or dictionaries are loaded */
  t: InlineTranslator<D>;
}

export interface HookTranslatorOptions {
  /** Override fallback to use if string is not available in active locale */
  fallback?: string;
  /** Override placholder that is displayed while a locale is loading */
  placeholder?: string;
}

export interface HookTranslator<D extends FlatDict, Options = HookTranslatorOptions, Output = string>
  extends Translator<D, Options, Output> {}

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

export interface InlineTranslator<D extends FlatDict> extends HookTranslator<D, InlineTranslatorOptions, ReactNode> {
  /** Render something using the currently active locale
   * @param renderFn your custom render function
   * @param locale override locale
   */
  render(renderFn: (t: HookTranslator<D>) => ReactNode, options?: { locale?: string }): ReactNode;
}
