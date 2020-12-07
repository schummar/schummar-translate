import { useCallback, useContext, useEffect, useState } from 'react';
import { LocaleContext } from './context';
import translate from './translate';
import { DeepPartial, Dict, FlatDict, FlatKeys, Options, TranslationProps, Values } from './types';
import React from 'react';

const browserLocale = typeof window === 'object' && 'navigator' in window ? window.navigator.language : undefined;

function flatten(dict: DeepPartial<Dict>, path = ''): FlatDict {
  const flat: FlatDict = {};

  for (const key in dict) {
    const newPath = path ? `${path}.${key}` : key;
    const value = dict[key];
    if (value === undefined) continue;
    else if (value instanceof Array || !(value instanceof Object)) flat[newPath] = value;
    else Object.assign(flat, flatten(value, newPath));
  }

  return flat;
}

export class Translator<D extends Dict> {
  constructor(private options: Options<D>) {}

  private dicts: { [locale: string]: FlatDict | Promise<FlatDict> } = {};

  private load(locale: string) {
    let dict;
    if (locale === this.options.sourceLocale) dict = this.options.sourceDictionary;
    else if (this.options.dicts instanceof Function) dict = this.options.dicts(locale);
    else dict = this.options.dicts[locale];

    if (dict instanceof Promise) return dict.then(flatten);
    return flatten(dict);
  }

  private useDicts(locale?: string) {
    const { locale: contextLocale } = useContext(LocaleContext);
    const [dicts, setDicts] = useState<FlatDict[]>([(this.load(this.options.sourceLocale) as unknown) as FlatDict]);

    locale ??= contextLocale ?? browserLocale;

    useEffect(() => {
      if (!locale) return;
      let cancel = false;

      const orderedLocales = [...new Set([locale].concat(this.options.fallbackLocale ?? [], this.options.sourceLocale))];
      const orderedDicts = orderedLocales.map((locale) => {
        return (this.dicts[locale] ??= this.load(locale));
      });

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
      [locale],
    );
  }
}

export function createTranslator<D extends Dict>(options: Options<D>) {
  const translator = new Translator(options);

  return {
    translator,
    translate: (id: FlatKeys<D>, values?: Values) => <Translate translator={translator} id={id} values={values} />,
    translateFallback: (id: FlatKeys<D>, fallback: string, values?: Values) => (
      <Translate translator={translator} id={id} values={values} fallback={fallback} />
    ),
  };
}

export default function Translate<D extends Dict>({ translator, ...props }: { translator: Translator<D> } & TranslationProps<D>) {
  const translate = translator.useTranslate(props.locale);
  const text = translate(props);
  console.log('-1', props);

  return <>{text instanceof Array ? text.map((paragraph, index) => <p key={index}>{paragraph}</p>) : text}</>;
}
