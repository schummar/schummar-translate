import { describe, expect, test } from 'vitest';
import { getPossibleLocales } from '../src/helpers';
import { Store } from '../src/store';

describe('getPossibleLocales', () => {
  test('should return the de and de-XX for de-DE', () => {
    const locales = getPossibleLocales('de-DE');
    expect(locales).toEqual(['de-DE', 'de', 'de-XX']);
  });

  test('should return de for de-DE if fallbackToMoreSpecific is false', () => {
    const locales = getPossibleLocales('de-DE', { fallbackToMoreSpecific: false });
    expect(locales).toEqual(['de-DE', 'de']);
  });

  test('should return de-XX for de-DE if fallbackToLessSpecific is false', () => {
    const locales = getPossibleLocales('de-DE', { fallbackToLessSpecific: false });
    expect(locales).toEqual(['de-DE', 'de-XX']);
  });

  test('should return en for de-DE if fallback is en', () => {
    const locales = getPossibleLocales('de-DE', { fallback: 'en' });
    expect(locales).toEqual(['de-DE', 'de', 'de-XX', 'en']);
  });
});

describe('Store', () => {
  test('should return strings for de-DE if available', async () => {
    const locales = getPossibleLocales('de-DE');
    const store = new Store({
      sourceLocale: 'en',
      sourceDictionary: { lang: 'en' },
      dicts: {
        'de-DE': { lang: 'de-DE' },
      },
    });

    const [dict] = await store.loadAll(...locales);
    expect(dict).toEqual({ lang: 'de-DE' });
  });

  test('should return strings for de if de-DE is not available', async () => {
    const locales = getPossibleLocales('de-DE');
    const store = new Store({
      sourceLocale: 'en',
      sourceDictionary: { lang: 'en' },
      dicts: {
        de: { lang: 'de' },
      },
    });

    const [dict] = await store.loadAll(...locales);
    expect(dict).toEqual({ lang: 'de' });
  });

  test('should return strings for de-AT if de-DE and de are not available', async () => {
    const locales = getPossibleLocales('de-AT');
    const store = new Store({
      sourceLocale: 'en',
      sourceDictionary: { lang: 'en' },
      dicts: {
        'de-AT': { lang: 'de-AT' },
      },
    });

    const [dict] = await store.loadAll(...locales);
    expect(dict).toEqual({ lang: 'de-AT' });
  });

  test('should return strings for en if de-DE and de and de-XX are not available', async () => {
    const locales = getPossibleLocales('de-DE', { fallback: 'en' });
    const store = new Store({
      sourceLocale: 'en',
      sourceDictionary: { lang: 'en' },
      dicts: {
        en: { lang: 'en' },
      },
    });

    const [dict] = await store.loadAll(...locales);
    expect(dict).toEqual({ lang: 'en' });
  });
});
