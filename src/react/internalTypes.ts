import React from 'react';
import { Format, TranslateKnown, TranslateUnknown } from '../internalTypes';
import { Dict } from '../types';

export type UseTranslatorOptions = {
  fallback?: string;
  placeholder?: string;
};

export type UseTranslator<D extends Dict> = (locale?: string) => TranslateKnown<D, UseTranslatorOptions, string> & {
  unknown: TranslateUnknown<UseTranslatorOptions, string>;
  format: Format<string>;
};

export type ReactTranslatorOptions = {
  locale?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
};

export type ReactTranslator<D extends Dict> = TranslateKnown<D, ReactTranslatorOptions, React.ReactNode> & {
  unknown: TranslateUnknown<ReactTranslatorOptions, React.ReactNode>;
  format: Format<React.ReactNode>;
};
