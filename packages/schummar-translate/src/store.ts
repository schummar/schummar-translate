import { match } from '@formatjs/intl-localematcher';
import { Cache } from './cache';
import { flattenDict } from './flattenDict';
import { arrEquals, isPromise } from './helpers';
import { CreateTranslatorOptions, Dict, MaybePromise, type FlattenDict } from './types';

export class Store<D extends Dict = any, FD extends FlattenDict<D> = FlattenDict<D>, ProvidedArgs extends string = never> {
  dicts = new Map<string, MaybePromise<FD | null>>();
  cache = new Cache(this.options.cacheOptions);
  subs = new Set<() => void>();

  constructor(
    public options: Pick<CreateTranslatorOptions<D, ProvidedArgs>, 'sourceLocale' | 'sourceDictionary' | 'dicts' | 'cacheOptions'>,
  ) {}

  load(locale: string): MaybePromise<FD | null> {
    let entry = this.dicts.get(locale);
    if (entry !== undefined) return entry;

    let dict = null;
    if (match([locale], [this.options.sourceLocale], '') && this.options.sourceDictionary) {
      dict = this.options.sourceDictionary;
    } else if (this.options.dicts instanceof Function) {
      try {
        dict = this.options.dicts(locale);

        if (isPromise(dict)) {
          dict = dict.catch(() => {
            console.warn(`Failed to load dictionary for locale "${locale}"`);
            return null;
          });
        }
      } catch {
        console.warn(`Failed to load dictionary for locale "${locale}"`);
        dict = null;
      }
    } else if (this.options.dicts) {
      const availableLocales = Object.keys(this.options.dicts);
      const matching = match([locale], availableLocales, locale);
      dict = this.options.dicts[matching] ?? null;
      if (dict instanceof Function) dict = dict();
    }

    if (isPromise(dict)) {
      entry = dict.then((resolvedDict) => {
        const flatDict = resolvedDict && (flattenDict(resolvedDict) as FD);
        if (this.dicts.get(locale) === entry) {
          this.dicts.set(locale, flatDict);
        }
        return flatDict;
      });
    } else {
      entry = dict && (flattenDict(dict) as FD);
    }

    this.dicts.set(locale, entry);

    if (isPromise(entry)) {
      entry.then(() => this.notify());
    } else {
      this.notify();
    }

    return entry;
  }

  loadAll(...locales: string[]): MaybePromise<FD[]> {
    const dicts = locales.map((locale) => this.load(locale));

    if (dicts.some(isPromise)) {
      return Promise.all(dicts).then((dicts) => dicts.filter(Boolean) as FD[]);
    }

    return dicts.filter(Boolean) as unknown as FD[];
  }

  getAll(...locales: string[]): MaybePromise<FD>[] {
    const dicts = locales.map((locale) => this.load(locale));
    return dicts.filter(Boolean) as MaybePromise<FD>[];
  }

  subscribe(locales: string[], callback: (dicts?: MaybePromise<FD>[]) => void): () => void {
    let last: MaybePromise<FD>[] | undefined;

    const sub = () => {
      const dicts = this.getAll(...locales);
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
    setTimeout(() => {
      for (const sub of this.subs) sub();
    });
  }
}
