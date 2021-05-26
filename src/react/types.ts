import React from 'react';
import { Dict, Options } from '../types';

export type OptionsReact<D extends Dict> = Options<D> & {
  fallbackElement?: React.ReactNode | ((id: string, sourceTranslation: string) => React.ReactNode);
  placeholder?: string | ((id: string, sourceTranslation: string) => string);
  placeholderElement?: React.ReactNode | ((id: string, sourceTranslation: string) => React.ReactNode);
};
