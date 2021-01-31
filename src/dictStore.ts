import { flattenDict } from './helpers';
import { Dict, FlatDict, MaybePromise, Options } from './types';

export class DictStore<D extends Dict> {
  constructor(public options: Options<D>) {
    this.dicts[options.sourceLocale] = flattenDict(options.sourceDictionary);
  }

  private dicts: { [locale: string]: MaybePromise<FlatDict | null> } = {};

  loadOne(locale: string): MaybePromise<FlatDict | null> {
    if (this.dicts[locale] !== undefined) return this.dicts[locale] as MaybePromise<FlatDict | null>;

    let dict;
    if (this.options.dicts instanceof Function) {
      dict = this.options.dicts(locale);
    } else {
      const getter = this.options.dicts[locale];
      if (getter instanceof Function) dict = getter();
      else dict = getter;
    }

    return (this.dicts[locale] = Promise.resolve(dict).then((dict) => (dict ? flattenDict(dict) : null)));
  }

  load(...locales: string[]): MaybePromise<FlatDict[]> {
    const dicts = locales.map((locale) => this.loadOne(locale));
    if (dicts.every((dict) => !(dict instanceof Promise))) {
      return dicts.filter(Boolean) as FlatDict[];
    }

    return Promise.all(dicts.map((dict) => Promise.resolve(dict))).then((dicts) => dicts.filter(Boolean) as FlatDict[]);
  }
}
