import { ICUArgument, ICUDateArgument } from './types';

export function resolveProvidedArgs(providedArgs?: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(providedArgs ?? {}).map(([id, value]) => {
      if (typeof value === 'object' && value !== null && 'get' in value) {
        return [id, value.get() as ICUArgument | ICUDateArgument];
      }

      return [id, value as ICUArgument | ICUDateArgument];
    }),
  );
}
