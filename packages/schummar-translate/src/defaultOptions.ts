import type { CreateTranslatorOptions } from './types';

export default function defaultOptions<
  T extends Pick<CreateTranslatorOptions<any, any>, 'fallbackToLessSpecific' | 'fallbackToMoreSpecific' | 'fallbackIgnoresFallbackLocales'>,
>(options: T): T {
  return {
    ...options,
    fallbackToLessSpecific: options.fallbackToLessSpecific ?? true,
    fallbackToMoreSpecific: options.fallbackToMoreSpecific ?? true,
    fallbackIgnoresFallbackLocales: options.fallbackIgnoresFallbackLocales ?? false,
  };
}
