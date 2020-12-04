import { useEffect, useState } from 'react';
import { Dict, Options, FlatDict, DeepPartial, TranslationProps } from './types';

export class Translator<D extends Dict> {
  constructor(private options: Options<D>) {}

  private dicts: { [locale: string]: Partial<FlatDict<D>> | Promise<Partial<FlatDict<D>>> } = {};

  private async load(locale: string) {
    if (locale === this.options.sourceLocale) return this.options.sourceDictionary;
    if (this.options.dicts instanceof Function) return this.options.dicts(locale);
    return this.options.dicts[locale];
  }

  useDict(locale?: string) {
    const [dict, setDict] = useState<Partial<FlatDict<D>>>();

    useEffect(() => {
      if (!locale) return;
      let cancel = false;
      let dictPromise = this.dicts[locale];
      if (!dict) dictPromise = this.dicts[locale] = this.load(locale);

      (async () => {
        const dict = await dictPromise;
        if (!cancel) setDict(dict);
      })();

      return () => {
        cancel = true;
      };
    }, [locale]);

    return dict;
  }
}

export default function createTranslator<D extends Dict>({ sourceDictionary, sourceLocale, fallbackLocale, dicts }: Options<D>) {}
