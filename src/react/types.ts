import React from 'react';
import { CreateTranslatorOptions, Dict, FlatDict, Format, GetTranslator, TranslateKnown, TranslateUnknown } from '../types';

export type ReactCreateTranslatorOptions<D extends Dict> = CreateTranslatorOptions<D> & {
  fallbackElement?: React.ReactNode | ((id: string, sourceTranslation: string) => React.ReactNode);
  placeholder?: string | ((id: string, sourceTranslation: string) => string);
  placeholderElement?: React.ReactNode | ((id: string, sourceTranslation: string) => React.ReactNode);
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

export type UseTranslator<D extends FlatDict> = (locale?: string) => TranslateKnown<D, UseTranslatorOptions, string> & {
  unknown: TranslateUnknown<UseTranslatorOptions, string>;
  format: Format<string>;
};

export type ReactTranslatorOptions = {
  locale?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
};

export type ReactTranslator<D extends FlatDict> = TranslateKnown<D, ReactTranslatorOptions, React.ReactNode> & {
  unknown: TranslateUnknown<ReactTranslatorOptions, React.ReactNode>;
  format: Format<React.ReactNode>;
};
