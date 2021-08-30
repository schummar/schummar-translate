import React, { ReactNode } from 'react';
import { CreateTranslatorOptions, Dict, FlatDict, Format, GetTranslator, TranslateKnown, TranslateUnknown } from '../types';

export type ReactCreateTranslatorOptions<D extends Dict> = CreateTranslatorOptions<D> & {
  /** Custom fallback handler. Will be called when a string is not available in the active locale.
   * @param id flat dictionary key
   * @param sourceTranslation translated string in source locale
   */
  fallbackElement?: ReactNode | ((id: string, sourceTranslation: string) => ReactNode);
  /** Display while a locale is loading */
  placeholder?: string | ((id: string, sourceTranslation: string) => string);
  /** Display while a locale is loading */
  placeholderElement?: ReactNode | ((id: string, sourceTranslation: string) => ReactNode);
};

export type ReactCreateTranslatorResult<D extends FlatDict> = {
  getTranslator: GetTranslator<D>;
  useTranslator: UseTranslator<D>;
  t: ReactTranslator<D>;
};

export type UseTranslatorOptions = {
  /** Override fallback to use if string is not available in active locale */
  fallback?: string;
  /** Override placholder that is displayed while a locale is loading */
  placeholder?: string;
};

export type UseTranslator<D extends FlatDict> = (locale?: string) => TranslateKnown<D, UseTranslatorOptions, string, readonly string[]> & {
  unknown: TranslateUnknown<UseTranslatorOptions, string>;
  format: Format<string>;
  locale: string;
};

export type ReactTranslatorOptions = {
  /** Override locale */
  locale?: string;
  /** Override fallback to use if string is not available in active locale */
  fallback?: ReactNode;
  /** Override placholder that is displayed while a locale is loading */
  placeholder?: ReactNode;
  /** Wrap string (or each line in case of array values) in the given component */
  component?: React.ElementType;
};

export type Render = {
  /** Render something using the currently active locale
   * @param renderFn your custom render function
   * @param dependencies if provided, will memoize the result of renderFn as long as dependencies stay the same (shallow compare)
   */
  (renderFn: (locale: string) => ReactNode, dependencies?: any[]): ReactNode;
};

export type ReactTranslator<D extends FlatDict> = TranslateKnown<D, ReactTranslatorOptions, ReactNode, ReactNode> & {
  unknown: TranslateUnknown<ReactTranslatorOptions, ReactNode>;
  format: Format<ReactNode>;
  render: Render;
};
