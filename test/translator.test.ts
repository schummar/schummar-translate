import test from 'ava';
import { createTranslator } from '../src';
import { dictDe, dictEn } from './_helpers';

const { getTranslator } = createTranslator({
  sourceDictionary: dictEn,
  sourceLocale: 'en',
  dicts: (locale) => (locale === 'de' ? dictDe : null),
});

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

  const date = new Date(2000, 0, 1, 0, 0, 0, 0);
  t.is(en('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date }), 'key3:en 1 one 1st 1/1/2000 12:00 AM');
  t.is(de('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date }), 'key3:de 1 eins 1te 1.1.2000 00:00');
});

test('format', async (t) => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  const date = new Date(2000, 0, 1, 0, 0, 0, 0);
  t.is(en.format('{date, date}', { date }), '1/1/2000');
  t.is(de.format('{date, date}', { date }), '1.1.2000');
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
