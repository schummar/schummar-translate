import type { CreateTranslatorOptions } from './types';

export default function defaultOptions<T extends Pick<CreateTranslatorOptions<any, any>, 'fallbackIgnoresFallbackLocales'>>(options: T): T {
  return {
    ...options,
    fallbackIgnoresFallbackLocales: options.fallbackIgnoresFallbackLocales ?? false,
  };
}
