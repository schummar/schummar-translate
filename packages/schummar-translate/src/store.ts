import { Cache } from './cache';
import { flattenDict } from './flattenDict';
import isTruthy, { arrEquals, isPromise } from './helpers';
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

    let dicts: MaybePromise<Dict | readonly [Dict, ...Dict[]] | null> = null;
    if (this.options.sourceDictionary && locale === this.options.sourceLocale) {
      dicts = this.options.sourceDictionary;
    } else if (this.options.dicts instanceof Function) {
      try {
        dicts = this.options.dicts(locale);
      } catch (error) {
        console.warn(`Failed to load dictionary for locale "${locale}"`, error);
      }
    } else if (this.options.dicts) {
      const dict = this.options.dicts[locale] ?? null;
      if (dict instanceof Function) {
        dicts = dict();
      } else {
        dicts = dict;
      }
    }

    if (isPromise(dicts)) {
      entry = dicts
        .then((dicts) => {
          return this.normalizeDicts(dicts);
        })
        .catch((error) => {
          console.warn(`Failed to load dictionary for locale "${locale}"`, error);
          return null;
        })
        .then((value) => {
          if (this.dicts.get(locale) === entry) {
            this.dicts.set(locale, value);
            this.notify();
          }

          return value;
        });

      this.dicts.set(locale, entry);
    } else {
      entry = this.normalizeDicts(dicts);

      this.dicts.set(locale, entry);
      this.notify();
    }

    return entry;
  }

  loadAll(...locales: string[]): MaybePromise<FD[]> {
    const dicts = locales.map((locale) => this.load(locale));

    if (dicts.some(isPromise)) {
      // oxlint-disable-next-line typescript/await-thenable
      return Promise.all(dicts).then((dicts) => dicts.filter(isTruthy));
    }

    return (dicts as FD[]).filter(isTruthy);
  }

  getAll(...locales: string[]): MaybePromise<FD | null>[] {
    const dicts = locales.map((locale) => this.load(locale));
    return dicts;
  }

  subscribe(locales: string[], callback: (dicts?: MaybePromise<FD | null>[]) => void): () => void {
    let last: MaybePromise<FD | null>[] | undefined;

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

  private normalizeDicts(dicts: Dict | readonly [Dict, ...Dict[]] | null): FD | null {
    if (dicts === null) {
      return null;
    }

    if (Array.isArray(dicts)) {
      return Object.assign({}, ...dicts.map((dict) => flattenDict(dict)).reverse()) as FD;
    }

    return flattenDict(dicts as Dict) as FD;
  }
}
