import { flattenDict } from './helpers';
import { Dict, FlatDict, MaybePromise, Options, PartialDict } from './types';

export class Translator<D extends Dict> {
  constructor(public options: Options<D>) {
    this.sourceDict = flattenDict(options.sourceDictionary);
  }

  sourceDict: FlatDict;
  private dicts: { [locale: string]: Promise<FlatDict> } = {};

  async load(locale: string): Promise<FlatDict> {
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
}
