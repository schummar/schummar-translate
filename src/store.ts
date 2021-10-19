import { match } from '@formatjs/intl-localematcher';
import { Cache } from './cache';
import { flattenDict } from './flattenDict';
import { arrEquals } from './helpers';
import { CreateTranslatorOptions, Dict, FlatDict, MaybePromise } from './types';

export class Store<D extends Dict = any> {
  dicts = new Map<string, MaybePromise<FlatDict | null>>();
  cache = new Cache(this.options.cacheOptions);
  subs = new Set<() => void>();

  constructor(public options: CreateTranslatorOptions<D>) {}

  load(locale: string): MaybePromise<FlatDict | null> {
    let entry = this.dicts.get(locale);
    if (entry !== undefined) return entry;

    let dict;
    if (match([locale], [this.options.sourceLocale], '') && this.options.sourceDictionary) {
      dict = this.options.sourceDictionary;
    } else if (this.options.dicts instanceof Function) {
      dict = this.options.dicts(locale);
    } else if (this.options.dicts) {
      const availableLocales = Object.keys(this.options.dicts);
      const matching = match([locale], availableLocales, locale);
      dict = this.options.dicts[matching] ?? null;
      if (dict instanceof Function) dict = dict();
    }

    if (dict instanceof Promise) {
      entry = dict
        .then((resolvedDict) => {
          const flatDict = resolvedDict && flattenDict(resolvedDict);
          if (this.dicts.get(locale) === entry) {
            this.dicts.set(locale, flatDict);
          }
          return flatDict;
        })
        .catch(() => null);
    } else {
      entry = dict && flattenDict(dict);
    }

    this.dicts.set(locale, entry ?? null);

    if (entry instanceof Promise) {
      entry.then(() => this.notify());
    } else {
      this.notify();
    }

    return entry ?? null;
  }

  loadAll(locales: readonly string[]): MaybePromise<FlatDict[]> {
    const dicts = locales.map((locale) => this.load(locale));

    if (dicts.some((dict) => dict instanceof Promise)) {
      return Promise.all(dicts).then((dicts) => dicts.filter(Boolean) as FlatDict[]);
    }

    return dicts.filter(Boolean) as unknown as FlatDict[];
  }

  getAll(locales: readonly string[]): FlatDict[] | undefined {
    const dicts = locales.map((locale) => this.load(locale));
    if (dicts.some((dict) => dict instanceof Promise)) return;
    return dicts.filter(Boolean) as FlatDict[];
  }

  subscribe(locales: readonly string[], callback: (dicts?: MaybePromise<FlatDict>[]) => void): () => void {
    let last: MaybePromise<FlatDict>[] | undefined;

    const sub = () => {
      const dicts = this.getAll(locales);
      if (!arrEquals(dicts, last)) {
        last = dicts;
        callback(dicts);
      }
    };
    sub();

    this.subs.add(callback);
    return () => {
      this.subs.delete(callback);
    };
  }

  clear(): void {
    this.dicts.clear();
    this.cache.clear();
    this.notify();
  }

  private notify() {
    for (const sub of this.subs) sub();
  }
}
