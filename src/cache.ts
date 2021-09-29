export function hash(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value instanceof Array || !(value instanceof Object)) return value;

    const result: Record<string, unknown> = {};

    for (const key of Object.keys(value).sort()) {
      result[key] = value[key];
    }

    return result;
  });
}

export type CacheOptions = { maxEntries?: number; ttl?: number };

export class Cache {
  private cache = new Map<any, Map<string, any>>();
  private delQueue = new Map<any, [t: number, k1: any, k2: string]>();

  constructor(private readonly options?: CacheOptions) {}

  get<C extends new (...args: any[]) => any>(C: C, ...args: ConstructorParameters<C>): InstanceType<C> {
    if (this.options?.maxEntries === 0) return new C(...args);

    const key = hash(args);

    let innerCache = this.cache.get(C);
    if (!innerCache) {
      innerCache = new Map();
      this.cache.set(C, innerCache);
    }

    let value = innerCache.get(key);
    if (!value) {
      this.clean();
      value = new C(...args);
      innerCache.set(key, value);
    }

    this.delQueue.delete(value);
    this.delQueue.set(value, [Date.now(), C, key]);

    return value;
  }

  private clean(): void {
    const { maxEntries, ttl } = this.options ?? {};
    const now = Date.now();

    for (const [k, [t, k1, k2]] of this.delQueue.entries()) {
      if ((maxEntries && maxEntries <= this.delQueue.size) || (ttl && t + ttl > now)) {
        const innerCache = this.cache.get(k1);
        this.delQueue.delete(k);
        innerCache?.delete(k2);
        if (innerCache?.size === 0) {
          this.cache.delete(k1);
        }
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}
