import React, { ReactNode } from 'react';
import { CreateTranslatorOptions, Dict, FlatDict, Format, GetTranslator, TranslateKnown, TranslateUnknown } from '../types';

export type ReactCreateTranslatorOptions<D extends Dict> = CreateTranslatorOptions<D> & {
  fallbackElement?: ReactNode | ((id: string, sourceTranslation: string) => ReactNode);
  placeholder?: string | ((id: string, sourceTranslation: string) => string);
  placeholderElement?: ReactNode | ((id: string, sourceTranslation: string) => ReactNode);
};

export type ReactCreateTranslatorResult<D extends FlatDict> = {
  getTranslator: GetTranslator<D>;
  useTranslator: UseTranslator<D>;
  t: ReactTranslator<D>;
};

export type UseTranslatorOptions = {
  fallback?: string;
  placeholder?: string;
};

export type UseTranslator<D extends FlatDict> = (locale?: string) => TranslateKnown<D, UseTranslatorOptions, string, readonly string[]> & {
  unknown: TranslateUnknown<UseTranslatorOptions, string>;
  format: Format<string>;
  locale: string;
};

export type ReactTranslatorOptions = {
  locale?: string;
  fallback?: ReactNode;
  placeholder?: ReactNode;
  component?: React.ElementType;
};

export type ReactTranslator<D extends FlatDict> = TranslateKnown<D, ReactTranslatorOptions, ReactNode, ReactNode> & {
  unknown: TranslateUnknown<ReactTranslatorOptions, ReactNode>;
  format: Format<ReactNode>;
  render: (render: (locale: string) => ReactNode) => ReactNode;
};
