import React from 'react';
import { Format, TranslateKnown, TranslateUnknown } from '../internalTypes';
import { Dict } from '../types';

export type UseTranslatorOptions = {
  fallback?: string;
  placeholder?: string;
};

export type UseTranslator<D extends Dict> = (locale?: string) => TranslateKnown<D, UseTranslatorOptions, string | null> & {
  unknown: TranslateUnknown<UseTranslatorOptions, string | null>;
  format: Format<string>;
};

export type TranslatorOptions = {
  locale?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
};

export type Translator<D extends Dict> = TranslateKnown<D, TranslatorOptions, React.ReactNode> & {
  unknown: TranslateUnknown<TranslatorOptions, React.ReactNode>;
  format: Format<React.ReactNode>;
};
