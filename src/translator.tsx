import { useCallback, useContext, useEffect, useState } from 'react';
import { flattenDict } from './helpers';
import translate from './translate';
import { TranslationContext } from './translationContext';
import { PartialDict, Dict, FlatDict, MaybePromise, Options, TranslationProps } from './types';

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

    let dict: MaybePromise<D | PartialDict<D> | undefined>;

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
    const [dicts, setDicts] = useState<FlatDict[]>([this.sourceDict]);

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
    }, [this, locale]);

    return dicts;
  }

  useTranslate(locale?: string): (props: TranslationProps<D>) => string | string[] {
    const { locale: contextLocale } = useContext(TranslationContext);
    locale ??= contextLocale;
    const dicts = this.useDicts(locale);

    return useCallback(
      (props: TranslationProps<D>) => {
        return translate(dicts, { locale, ...props });
      },
      [dicts],
    );
  }
}
