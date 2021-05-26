import { flattenDict } from './flattenDict';
import { Dict, FlatDict, MaybePromise, Options } from './types';

export class DictStore<D extends Dict> {
  sourceDict: FlatDict;

  constructor(public options: Options<D>) {
    this.sourceDict = flattenDict(options.sourceDictionary);
  }

  private dicts: { [locale: string]: MaybePromise<FlatDict | null> } = {};

  loadOne(locale: string): MaybePromise<FlatDict | null> {
    if (locale === this.options.sourceLocale) return this.sourceDict;

    const existing = this.dicts[locale];
    if (existing !== undefined) return existing;

    let dict;
    if (this.options.dicts instanceof Function) {
      dict = this.options.dicts(locale);
    } else {
      const getter = this.options.dicts?.[locale];
      if (getter instanceof Function) dict = getter();
      else dict = getter;
    }

    return (this.dicts[locale] = Promise.resolve(dict).then((dict) => {
      return (this.dicts[locale] = dict ? flattenDict(dict) : null);
    }));
  }

  load(...locales: string[]): MaybePromise<FlatDict[]> {
    const dicts = locales.map((locale) => this.loadOne(locale));
    if (dicts.every((dict) => !(dict instanceof Promise))) {
      return dicts.filter(Boolean) as FlatDict[];
    }

    return Promise.all(dicts.map((dict) => Promise.resolve(dict))).then((dicts) => dicts.filter(Boolean) as FlatDict[]);
  }
}
