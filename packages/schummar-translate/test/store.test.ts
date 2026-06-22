import { Store } from '../src/store';
import { describe, expect, test, vi } from 'vite-plus/test';

describe('Store', () => {
  test('should return matching dicts in order', async () => {
    const store = new Store({
      sourceLocale: 'en',
      sourceDictionary: { lang: 'en' },
      dicts: {
        'de-DE': { lang: 'de-DE' },
        de: { lang: 'de' },
        'de-AT': { lang: 'de-AT' },
        en: { lang: 'en' },
      },
    });

    const dicts = await store.loadAll('de-DE', 'de', 'de-AT');
    expect(dicts).toEqual([{ lang: 'de-DE' }, { lang: 'de' }, { lang: 'de-AT' }]);
  });

  test('should include source dictionary as well', async () => {
    const store = new Store({
      sourceLocale: 'de',
      sourceDictionary: { lang: 'de' },
      dicts: {
        'de-DE': { lang: 'de-DE' },
      },
    });

    const dicts = await store.loadAll('de-DE', 'de');
    expect(dicts).toEqual([{ lang: 'de-DE' }, { lang: 'de' }]);
  });

  test('should return dynamically loaded dicts', async () => {
    const store = new Store({
      sourceLocale: 'en',
      dicts: {
        'de-DE': () => Promise.resolve({ lang: 'de-DE' }),
        de: () => Promise.resolve({ lang: 'de' }),
        en: () => Promise.resolve({ lang: 'en' }),
      },
    });

    const dicts = await store.loadAll('de-DE', 'de', 'en');
    expect(dicts).toEqual([{ lang: 'de-DE' }, { lang: 'de' }, { lang: 'en' }]);
  });

  test('should return dict when dicts is a function', async () => {
    const store = new Store({
      sourceLocale: 'en',
      dicts: (locale) => Promise.resolve(locale === 'de-DE' ? { lang: 'de-DE' } : null),
    });

    const dicts = await store.loadAll('de-DE');
    expect(dicts).toEqual([{ lang: 'de-DE' }]);
  });

  test('should return merged dicts when dicts function returns multiple dicts', async () => {
    const store = new Store({
      sourceLocale: 'en',
      dicts: (locale) => Promise.resolve(locale === 'de-DE' ? [{ lang: 'de-DE' }, { lang: 'de' }] : null),
    });

    const dicts = await store.loadAll('de-DE', 'de');
    expect(dicts).toEqual([{ lang: 'de-DE' }]);
  });

  test('should handle dict loading errors gracefully', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const store = new Store({
      sourceLocale: 'en',
      dicts: {
        'de-DE': () => Promise.reject(new Error('Failed to load')),
        de: { lang: 'de' },
      },
    });

    const dicts = await store.loadAll('de-DE', 'de');
    expect(dicts).toEqual([{ lang: 'de' }]);
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(`Failed to load dictionary for locale "de-DE"`, Error('Failed to load'));
  });
});
