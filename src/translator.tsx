import { useCallback, useContext, useEffect, useState } from 'react';
import { flattenDict } from './helpers';
import translate from './translate';
import { TranslationContext } from './translationContext';
import { DeepPartial, Dict, FlatDict, MaybePromise, Options, TranslationProps } from './types';

export class Translator<D extends Dict> {
  constructor(private options: Options<D>) {
    this.sourceDict = flattenDict(options.sourceDictionary);
  }

  private sourceDict: FlatDict;
  private dicts: { [locale: string]: Promise<FlatDict> } = {};

  private load(locale: string): MaybePromise<FlatDict> {
    if (locale === this.options.sourceLocale) return this.sourceDict;

    const fromCache = this.dicts[locale];
    if (fromCache) return fromCache;

    let dict: MaybePromise<D | DeepPartial<D> | undefined>;

    if (this.options.dicts instanceof Function) {
      dict = this.options.dicts(locale);
    } else {
      dict = this.options.dicts[locale];
    }

    const promise = Promise.resolve(dict).then((dict) => {
      if (!dict) {
        console.warn('Missing dict:', locale);
        return {};
      }

      return flattenDict(dict);
    });

    this.dicts[locale] = promise;
    return promise;
  }

  private useDicts(locale?: string) {
    const { locale: contextLocale } = useContext(TranslationContext);
    const [dicts, setDicts] = useState<FlatDict[]>([this.sourceDict]);

    locale ??= contextLocale;

    useEffect(() => {
      if (!locale) return;
      let cancel = false;

      const orderedLocales = [...new Set([locale].concat(this.options.fallbackLocale ?? [], this.options.sourceLocale))];
      const orderedDicts = orderedLocales.map((locale) => this.load(locale));

      Promise.all(orderedDicts).then((orderedDicts) => {
        if (!cancel) setDicts(orderedDicts);
      });

      return () => {
        cancel = true;
      };
    }, [locale]);

    return dicts;
  }

  useTranslate(locale?: string) {
    const dicts = this.useDicts(locale);

    return useCallback(
      (props: TranslationProps<D>) => {
        return translate(dicts, props);
      },
      [dicts],
    );
  }
}
