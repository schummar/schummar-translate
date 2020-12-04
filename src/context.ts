import { createContext } from 'react';

export const LocaleContext = createContext<{ locale?: string }>({});
