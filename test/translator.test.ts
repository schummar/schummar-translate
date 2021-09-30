import test from 'ava';
import { createTranslator } from '../src';
import { Cache } from '../src/cache';
import { dictDe, dictEn } from './_helpers';

const { getTranslator } = createTranslator({
  sourceDictionary: dictEn,
  sourceLocale: 'en',
  dicts: (locale) => (locale === 'de' ? dictDe : null),
});

const date = new Date(2000, 1, 2, 3, 4, 5);

test('simple', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en('key1'), 'key1:en');
  t.is(de('key1'), 'key1:de');
});

test('with value', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en('nested.key2', { value2: 'v2' }), 'key2:en v2');
  t.is(de('nested.key2', { value2: 'v2' }), 'key2:de v2');
});

test('with complex values', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date }), 'key3:en 1 one 1st 2/2/2000 3:04 AM');
  t.is(de('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date }), 'key3:de 1 eins 1te 2.2.2000 03:04');
});

test('format', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en.format('{date, date}', { date }), '2/2/2000');
  t.is(de.format('{date, date}', { date }), '2.2.2000');
});

test('wrong format', async (t) => {
  const en = await getTranslator('en');
  t.is(en.format('{number, numbr}', { number: 1 }), 'Wrong format: SyntaxError: INVALID_ARGUMENT_TYPE');
});

test('warn', async (t) => {
  t.plan(3);

  const { getTranslator } = createTranslator({
    sourceDictionary: dictEn,
    sourceLocale: 'en',
    dicts: (locale) => (locale === 'de' ? dictDe : null),
    warn: (locale, id) => {
      t.is(locale, 'en');
      t.is(id, 'missingKey');
    },
  });
  const en = await getTranslator('en');
  t.is(en.unknown('missingKey'), 'missingKey');
});

test('array', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.deepEqual(en('arr', { pOne: 'p1', pTwo: 'p2' }), ['one p1', 'two p2']);
  t.deepEqual(de('arr', { pOne: 'p1', pTwo: 'p2' }), ['eins p1', 'zwei p2']);
});

test('locale', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en.locale, 'en');
  t.is(de.locale, 'de');
});

test('plural without other', async (t) => {
  const ru = await getTranslator('ru');
  t.is(ru.format('{x, plural, one {# one} few {# few} many {# many}}', { x: 1 }), '1 one');
  t.is(ru.format('{x, plural, one {# one} few {# few} many {# many}}', { x: 2 }), '2 few');
  t.is(ru.format('{x, plural, one {# one} few {# few} many {# many}}', { x: 5 }), '5 many');
});

test('dateTimeFormat', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en.dateTimeFormat(date, { dateStyle: 'long', timeStyle: 'short' }), 'February 2, 2000 at 3:04 AM');
  t.is(de.dateTimeFormat(date, { dateStyle: 'long', timeStyle: 'short' }), '2. Februar 2000 um 03:04');
});

test('displayNames', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en.displayNames('de', { type: 'language' }), 'German');
  t.is(de.displayNames('de', { type: 'language' }), 'Deutsch');
});

test('listFormat', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en.listFormat(['a', 'b', 'c'], { type: 'conjunction' }), 'a, b, and c');
  t.is(de.listFormat(['a', 'b', 'c'], { type: 'conjunction' }), 'a, b und c');
});

test('numberFormat', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en.numberFormat(12.34, { maximumFractionDigits: 1 }), '12.3');
  t.is(de.numberFormat(12.34, { maximumFractionDigits: 1 }), '12,3');
});

test('pluralRules', async (t) => {
  const en = await getTranslator('en');
  const pl = await getTranslator('pl');

  t.is(en.pluralRules(4), 'other');
  t.is(pl.pluralRules(4), 'few');
});

test('relativeTimeFormat', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  t.is(en.relativeTimeFormat(-30, 'seconds'), '30 seconds ago');
  t.is(de.relativeTimeFormat(-30, 'seconds'), 'vor 30 Sekunden');
});

test('clear', async (t) => {
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
  t.is(count, 1);

  clearDicts();
  await getTranslator('en');
  t.is(count, 2);
});

test('cache', async (t) => {
  let count = 0;

  class Mock {
    constructor(private options: { n: number }) {
      count++;
    }
  }

  const cache = new Cache({ maxEntries: 1 });
  cache.get(Mock, { n: 1 });
  cache.get(Mock, { n: 1 });
  t.is(count, 1);

  cache.get(Mock, { n: 2 });
  cache.get(Mock, { n: 1 });
  t.is(count, 3);
});
