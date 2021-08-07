import React from 'react';
import { Dict, CreateTranslatorOptions } from '../types';

export type ReactCreateTranslatorOptions<D extends Dict> = CreateTranslatorOptions<D> & {
  fallbackElement?: React.ReactNode | ((id: string, sourceTranslation: string) => React.ReactNode);
  placeholder?: string | ((id: string, sourceTranslation: string) => string);
  placeholderElement?: React.ReactNode | ((id: string, sourceTranslation: string) => React.ReactNode);
};
