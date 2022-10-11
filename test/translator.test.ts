import { describe, expect, test } from 'vitest';
import { createTranslator } from '../src';
import { Cache } from '../src/cache';
import { dictDe, dictEn, dictEnCa } from './_helpers';

const { getTranslator } = createTranslator({
  sourceDictionary: dictEn,
  sourceLocale: 'en',
  dicts: (locale) => (locale === 'de' ? dictDe : null),
});

const date = new Date(2000, 1, 2, 3, 4, 5);

test('simple', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en('key1')).toBe('key1:en');
  expect(de('key1')).toBe('key1:de');
});

test('with value', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en('nested.key2', { value2: 'v2' })).toBe('key2:en v2');
  expect(de('nested.key2', { value2: 'v2' })).toBe('key2:de v2');
});

test('with complex values', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date })).toBe('key3:en 1 one 1st 2/2/2000 3:04 AM');
  expect(de('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date })).toBe('key3:de 1 eins 1te 2.2.2000 03:04');
});

test('format', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.format('{date, date}', { date })).toBe('2/2/2000');
  expect(de.format('{date, date}', { date })).toBe('2.2.2000');
});

test('wrong format', async () => {
  const en = await getTranslator('en');
  expect(en.format('{number, numbr}', { number: 1 })).toBe('Wrong format: SyntaxError: INVALID_ARGUMENT_TYPE');
});

test('warn', async () => {
  expect.assertions(3);

  const { getTranslator } = createTranslator({
    sourceDictionary: dictEn,
    sourceLocale: 'en',
    dicts: (locale) => (locale === 'de' ? dictDe : null),
    warn: (locale, id) => {
      expect(locale).toBe('en');
      expect(id).toBe('missingKey');
    },
  });
  const en = await getTranslator('en');
  expect(en.unknown('missingKey')).toBe('missingKey');
});

test('array', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en('arr', { pOne: 'p1', pTwo: 'p2' })).toEqual(['one p1', 'two p2']);
  expect(de('arr', { pOne: 'p1', pTwo: 'p2' })).toEqual(['eins p1', 'zwei p2']);
});

test('locale', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.locale).toBe('en');
  expect(de.locale).toBe('de');
});

test('plural without other', async () => {
  const ru = await getTranslator('ru');
  expect(ru.format('{x, plural, one {# one} few {# few} many {# many}}', { x: 1 })).toBe('1 one');
  expect(ru.format('{x, plural, one {# one} few {# few} many {# many}}', { x: 2 })).toBe('2 few');
  expect(ru.format('{x, plural, one {# one} few {# few} many {# many}}', { x: 5 })).toBe('5 many');
});

test('dateTimeFormat', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.dateTimeFormat(date, { dateStyle: 'long', timeStyle: 'short' })).toBe('February 2, 2000 at 3:04 AM');
  expect(de.dateTimeFormat(date, { dateStyle: 'long', timeStyle: 'short' })).toBe('2. Februar 2000 um 03:04');
});

test('displayNames', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.displayNames('de', { type: 'language' })).toBe('German');
  expect(de.displayNames('de', { type: 'language' })).toBe('Deutsch');
});

test('listFormat', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.listFormat(['a', 'b', 'c'], { type: 'conjunction' })).toBe('a, b, and c');
  expect(de.listFormat(['a', 'b', 'c'], { type: 'conjunction' })).toBe('a, b und c');
});

test('numberFormat', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.numberFormat(12.34, { maximumFractionDigits: 1 })).toBe('12.3');
  expect(de.numberFormat(12.34, { maximumFractionDigits: 1 })).toBe('12,3');
});

test('pluralRules', async () => {
  const en = await getTranslator('en');
  const pl = await getTranslator('pl');

  expect(en.pluralRules(4)).toBe('other');
  expect(pl.pluralRules(4)).toBe('few');
});

test('relativeTimeFormat', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.relativeTimeFormat(-30, 'seconds')).toBe('30 seconds ago');
  expect(de.relativeTimeFormat(-30, 'seconds')).toBe('vor 30 Sekunden');
});

test('clear', async () => {
  let count = 0;

  const { getTranslator, clearDicts } = createTranslator({
    sourceLocale: 'en',
    dicts: () => {
      count++;
      return dictEn;
    },
  });

  await getTranslator('en');
  await getTranslator('en');
  expect(count).toBe(1);

  clearDicts();
  await getTranslator('en');
  expect(count).toBe(2);
});

test('cache', async () => {
  let count = 0;

  class Mock {
    constructor(private options: { n: number }) {
      count++;
    }
  }

  const cache = new Cache({ maxEntries: 1 });
  cache.get(Mock, { n: 1 });
  cache.get(Mock, { n: 1 });
  expect(count).toBe(1);

  cache.get(Mock, { n: 2 });
  cache.get(Mock, { n: 1 });
  expect(count).toBe(3);
});

test('match locales', async () => {
  const { getTranslator } = createTranslator({
    sourceLocale: 'en',
    sourceDictionary: dictEn,
  });
  const _t = await getTranslator('en-US');
  expect(_t('key1')).toBe('key1:en');
});

describe('fallback order', () => {
  test('with fallbackToLessSpecific', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'de',
      sourceDictionary: dictDe,
      dicts: {
        en: dictEn,
        'en-CA': dictEnCa,
      },
      fallbackLocale: 'de',
    });
    const _t = await getTranslator('en-CA');

    expect(_t('key1')).toBe('key1:en');
    expect(_t('deOnly')).toBe('deOnly:de');
  });

  test('without fallbackToLessSpecific', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'de',
      sourceDictionary: dictDe,
      dicts: {
        en: dictEn,
        'en-CA': dictEnCa,
      },
      fallbackLocale: 'de',
      fallbackToLessSpecific: false,
    });
    const _t = await getTranslator('en-CA');

    expect(_t('key1')).toBe('key1:de');
    expect(_t('deOnly')).toBe('deOnly:de');
  });
});
