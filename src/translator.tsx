import { DictStore } from './dictStore';
import { Format, GetTranslator, GetTranslatorOptions, TranslateKnown, TranslateUnknown } from './internalTypes';
import { format, translate } from './translate';
import { Dict, Options } from './types';

export function createTranslator<D extends Dict>(
  options: Options<D>,
): {
  getTranslator: GetTranslator<D>;
} {
  const store = new DictStore(options);
  const { fallbackLocale = [], fallback: globalFallback, warn } = options;

  const getTranslator: GetTranslator<D> = async (locale: string) => {
    const localeFallbackOrder = [locale, ...fallbackLocale];
    const dicts = await store.load(...new Set(localeFallbackOrder));

    const t: TranslateUnknown<GetTranslatorOptions, string> = (id, ...[values, options]) => {
      const fallback = options?.fallback ?? globalFallback;
      return translate({ dicts, sourceDict: store.sourceDict, id, values, fallback, locale, warn }) as string;
    };

    const f: Format<string> = (template, ...[values]) => {
      return format(template, values as any, locale);
    };

    return Object.assign(t as TranslateKnown<D, GetTranslatorOptions, string>, {
      unknown: t,
      format: f,
    });
  };

  return {
    getTranslator,
  };
}
