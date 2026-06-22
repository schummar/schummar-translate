import { getPossibleLocales } from '../src/helpers';
import { describe, expect, test } from 'vite-plus/test';

describe('getPossibleLocales', () => {
  test('should return matching locales in order', () => {
    const locales = getPossibleLocales('de-DE', {
      sourceLocale: 'en',
      dicts: { de: {}, 'de-DE': {}, 'de-AT': {}, en: {} },
    });
    expect(locales).toEqual(['de-DE', 'de', 'de-AT']);
  });

  test('should include source locale as well', () => {
    const locales = getPossibleLocales('de-DE', {
      sourceLocale: 'de',
      dicts: { 'de-DE': {} },
    });
    expect(locales).toEqual(['de-DE', 'de']);
  });

  test('should return only requested locale if dicts is a function', () => {
    const locales = getPossibleLocales('de-DE', {
      sourceLocale: 'en',
      dicts: () => ({ 'de-DE': {}, de: {}, en: {} }),
    });
    expect(locales).toEqual(['de-DE']);
  });
});
