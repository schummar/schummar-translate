import React, { createContext, useMemo } from 'react';

export const TranslationContext = createContext({
  locale: typeof window === 'object' && 'navigator' in window ? window.navigator.language.slice(0, 2) : undefined,
});

export const TranslationContextProvider = ({ locale, children }: { locale?: string; children?: React.ReactNode }): JSX.Element => {
  const value = useMemo(() => ({ locale }), [locale]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};
