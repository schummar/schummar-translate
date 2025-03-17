import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, expectTypeOf, test } from 'vitest';
import { createTranslator } from '../src';
import { Cache } from '../src/cache';
import {
  ICUArgument,
  ICUDateArgument,
  ICUNumberArgument,
  OtherString,
  type EmptyObject,
  type FlattenDict,
  type GetTranslatorOptions,
} from '../src/types';
import { dictDe, dictEn, dictEnCa } from './_helpers';
import type { GetICUArgs } from '../src/extractICU';

type EnDict = typeof dictEn;
interface Dict extends EnDict {}

const { getTranslator } = createTranslator<Dict>({
  sourceDictionary: dictEn,
  sourceLocale: 'en',
  dicts: (locale) => (locale === 'de' ? dictDe : null),
});

const date = new Date(2000, 1, 2, 3, 4, 5);
const date2 = new Date(2001, 1, 2, 3, 4, 5);

test('simple', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expectTypeOf(en<'key1'>).parameters.toEqualTypeOf<[id: 'key1', values?: EmptyObject, options?: GetTranslatorOptions]>();
  expect(en('key1')).toBe('key1:en');
  expect(de('key1')).toBe('key1:de');
});

test('with value', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expectTypeOf(en<'nested.key2'>).parameters.toEqualTypeOf<
    [id: 'nested.key2', values: { value2: ICUArgument }, options?: GetTranslatorOptions]
  >();
  expect(en('nested.key2', { value2: 'v2' })).toBe('key2:en v2');
  expect(de('nested.key2', { value2: 'v2' })).toBe('key2:de v2');
});

test('with complex values', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expectTypeOf(en<'nested.key3'>).parameters.toEqualTypeOf<
    [
      id: 'nested.key3',
      values: {
        number: ICUNumberArgument;
        plural: ICUNumberArgument;
        selectordinal: ICUNumberArgument;
        date: ICUDateArgument;
        time: ICUDateArgument;
      },
      options?: GetTranslatorOptions,
    ]
  >();
  expect(en('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date })).toBe('key3:en 1 one 1st 2/2/2000 3:04 AM');
  expect(de('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date })).toBe('key3:de 1 eins 1te 2.2.2000 03:04');
});

test('format', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expectTypeOf(en.format<'{date, date}'>).parameters.toEqualTypeOf<
    [template: '{date, date}', values: { date: ICUDateArgument }, options?: undefined]
  >();
  expect(en.format('{date, date}', { date })).toBe('2/2/2000');
  expect(de.format('{date, date}', { date })).toBe('2.2.2000');
});

test('wrong format', async () => {
  const en = await getTranslator('en');
  expect(en.format('{number, numbr}', { number: 1 })).toBe('Wrong format: SyntaxError: INVALID_ARGUMENT_TYPE');
});

test('unknown', async () => {
  const en = await getTranslator('en');

  expectTypeOf(en.unknown).parameters.toEqualTypeOf<[id: string, values?: Record<string, unknown>, options?: GetTranslatorOptions]>();
  expect(en.unknown('unknownKey', { value: 1 })).toBe('unknownKey');
});

describe('dynamic', () => {
  test('with known key', async () => {
    const en = await getTranslator('en');

    expectTypeOf(en.dynamic<'nested.key2'>).parameters.toEqualTypeOf<
      [id: 'nested.key2', values: { value2: ICUArgument }, options?: GetTranslatorOptions]
    >();
    expect(en.dynamic('nested.key2', { value2: 1 })).toBe('key2:en 1');
  });

  test('with partially known key', async () => {
    const en = await getTranslator('en');

    expectTypeOf(en.dynamic<`pattern${number}`>).parameters.toEqualTypeOf<
      [
        id: `pattern${number}`,
        values: {
          value1: ICUArgument;
          value2: ICUArgument;
        },
        options?: GetTranslatorOptions | undefined,
      ]
    >();
    expect(en.dynamic('pattern1' as `pattern${number}`, { value1: 1, value2: 2 })).toBe('pattern1 1');
  });

  test('with unknown value', async () => {
    const en = await getTranslator('en');

    expectTypeOf(en.dynamic<'unknownKey'>).parameters.toEqualTypeOf<
      [id: keyof FlattenDict<Dict>, values?: unknown, options?: GetTranslatorOptions]
    >();
    // @ts-expect-error unknownKey is known not to be in the dictionary
    expect(en.dynamic('unknownKey')).toBe('unknownKey');
  });
});

test('union', async () => {
  const { getTranslator } = createTranslator({
    sourceDictionary: {
      a: 'a',
      b: 'b {valueB}',
      c: ['c1 {valueC1}', 'c2 {valueC2}'],
    } as const,
    sourceLocale: 'en',
  });

  const en = await getTranslator('en');

  expectTypeOf(en.dynamic<'a' | 'b' | 'c'>).parameters.toEqualTypeOf<
    [
      id: 'a' | 'b' | 'c',
      values: {
        valueB: ICUArgument;
        valueC1: ICUArgument;
        valueC2: ICUArgument;
      },
      options?: GetTranslatorOptions | undefined,
    ]
  >();

  expect(en.dynamic('a' as 'a' | 'b' | 'c', { valueB: 1, valueC1: 2, valueC2: 3 })).toBe('a');
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

describe('dateTimeFormat', () => {
  test('dateTimeFormat', async () => {
    const en = await getTranslator('en');
    const de = await getTranslator('de');

    expect(en.dateTimeFormat(date, { dateStyle: 'long', timeStyle: 'short' })).toBe('February 2, 2000 at 3:04 AM');
    expect(de.dateTimeFormat(date, { dateStyle: 'long', timeStyle: 'short' })).toBe('2. Februar 2000 um 03:04');
  });

  test('with Temporal.Instant and rendered in specific timeZone', async () => {
    const de = await getTranslator('de');

    expect(
      de.dateTimeFormat(Temporal.Instant.from('2023-01-01T00:00:00Z'), {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Europe/Berlin',
      }),
    ).toBe('01.01.2023, 01:00:00');
  });

  test('with Temporal.Instant and rendered in UTC', async () => {
    const de = await getTranslator('de');

    expect(
      de.dateTimeFormat(Temporal.Instant.from('2023-01-01T00:00:00Z'), { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'UTC' }),
    ).toBe('01.01.2023, 00:00:00');
  });

  test('with Temporal.ZonedDateTime rendered in specific timeZone', async () => {
    const de = await getTranslator('de');

    expect(
      de.dateTimeFormat(Temporal.ZonedDateTime.from('2023-01-01T00:00:00[Europe/Berlin]'), {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Europe/Berlin',
      }),
    ).toBe('01.01.2023, 00:00:00');
  });

  test('with Temporal.ZonedDateTime rendered in UTC', async () => {
    const de = await getTranslator('de');

    expect(
      de.dateTimeFormat(Temporal.ZonedDateTime.from('2023-01-01T00:00:00[Europe/Berlin]'), {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'UTC',
      }),
    ).toBe('31.12.2022, 23:00:00');
  });

  test('with Temporal.PlainDateTime rendered in specific timeZone', async () => {
    const de = await getTranslator('de');

    expect(
      de.dateTimeFormat(Temporal.PlainDateTime.from('2023-01-01T00:00:00'), {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Europe/Berlin',
      }),
    ).toBe('01.01.2023, 00:00:00');
  });

  test('with Temporal.PlainDateTime rendered in UTC', async () => {
    const de = await getTranslator('de');

    expect(
      de.dateTimeFormat(Temporal.PlainDateTime.from('2023-01-01T00:00:00'), { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'UTC' }),
    ).toBe('01.01.2023, 00:00:00');
  });

  test('with Temporal.PlainDate', async () => {
    const de = await getTranslator('de');

    expect(de.dateTimeFormat(Temporal.PlainDate.from('2023-01-01'), { dateStyle: 'medium', timeStyle: 'medium' })).toBe('01.01.2023');
  });

  test('with Temporal.PlainTime', async () => {
    const de = await getTranslator('de');

    expect(de.dateTimeFormat(Temporal.PlainTime.from('00:00:00'), { dateStyle: 'medium', timeStyle: 'medium' })).toBe('00:00:00');
  });

  test('format with Temporal', async () => {
    const de = await getTranslator('de');

    expect(de.format('{x, date, medium} # {x, time, medium}', { x: Temporal.PlainDateTime.from('2023-01-01T00:00:00') })).toBe(
      '1. Jan. 2023 # 00:00:00',
    );
  });
});

test('dateTimeFormatRange', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.dateTimeFormatRange(date, date2, { dateStyle: 'long', timeStyle: 'short' })).toMatchInlineSnapshot(
    '"February 2, 2000 at 3:04 AM – February 2, 2001 at 3:04 AM"',
  );
  expect(de.dateTimeFormatRange(date, date2, { dateStyle: 'long', timeStyle: 'short' })).toMatchInlineSnapshot(
    '"2. Februar 2000 um 03:04 – 2. Februar 2001 um 03:04"',
  );
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

// test('numberFormatRange', async () => {
//   const en = await getTranslator('en');
//   const de = await getTranslator('de');

//   expect(en.numberFormatRange(1, 2, { maximumFractionDigits: 1 })).toBe('1–2');
//   expect(de.numberFormatRange(1, 2, { maximumFractionDigits: 1 })).toBe('1–2');
// });

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

test('durationFormat', async () => {
  const en = await getTranslator('en');
  const de = await getTranslator('de');

  expect(en.durationFormat({ seconds: 1 }, { style: 'long' })).toBe('1 second');
  expect(de.durationFormat({ seconds: 1 }, { style: 'long' })).toBe('1 Sekunde');
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

  test('with fallbackIgnoresFallbackLocales=true', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'de',
      sourceDictionary: dictDe,
      fallbackLocale: 'de',
      dicts: {
        de: { key1: 'value' },
        en: {},
      },
      fallbackIgnoresFallbackLocales: true,
    });

    const _t = await getTranslator('en');
    expect(_t('key1', {}, { fallback: 'fallback' })).toBe('fallback');
    expect(_t.unknown('key2', {}, { fallback: 'fallback' })).toBe('fallback');
  });

  test('with fallbackIgnoresFallbackLocales=false', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'de',
      sourceDictionary: dictDe,
      fallbackLocale: 'de',
      dicts: {
        de: { key1: 'value' },
        en: {},
      },
      fallbackIgnoresFallbackLocales: false,
    });

    const _t = await getTranslator('en');
    expect(_t('key1', {}, { fallback: 'fallback' })).toBe('key1:de');
    expect(_t.unknown('key2', {}, { fallback: 'fallback' })).toBe('fallback');
  });
});

describe('ignoreMissingArgs', () => {
  test('without ignoreMissingArgs', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'en',
      sourceDictionary: dictEn,
    });

    const _t = await getTranslator('en');

    expect(_t('nested.key2', {} as any)).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "value2" was not provided to the string "undefined""`,
    );
  });

  test('with ignoreMissingArgs=true', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'en',
      sourceDictionary: dictEn,
      ignoreMissingArgs: true,
    });

    const _t = await getTranslator('en');
    expect(_t('nested.key2', {} as any)).toBe('key2:en ');
  });

  test('with ignoreMissingArgs as string', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'en',
      sourceDictionary: dictEn,
      ignoreMissingArgs: 'ignore',
    });

    const _t = await getTranslator('en');
    expect(_t('nested.key2', {} as any)).toBe('key2:en ignore');
  });

  test('with ignoreMissingArgs as function', async () => {
    const { getTranslator } = createTranslator({
      sourceLocale: 'en',
      sourceDictionary: dictEn,
      ignoreMissingArgs: (key, template) => `ignore-${key}-${template}}`,
    });

    const _t = await getTranslator('en');
    expect(_t('nested.key2', {} as any)).toBe('key2:en ignore-value2-key2:en {value2}}');
  });
});

describe('select types', () => {
  test('select', async () => {
    const _t = await getTranslator('en');

    expect(_t('select', { value: 'option1' })).toBe('text text1 text');
    expect(_t('select', { value: 'option2' })).toBe('text text2 text');
    // @ts-expect-error only listed options are allowed
    expect(_t('select', { value: 'foo' })).toMatchInlineSnapshot(
      `"Wrong format: Error: Invalid values for "value": "foo". Options are "0", "1""`,
    );
  });

  test('select with other', async () => {
    const _t = await getTranslator('en');
    expect(_t('selectWithOther', { value: 'option1' })).toBe('text text1 text');
    expect(_t('selectWithOther', { value: 'option2' })).toBe('text text2 text');
    expect(_t('selectWithOther', { value: 'foo' })).toBe('text text3 text');
  });

  test('select with nested', async () => {
    const _t = await getTranslator('en');
    //@ts-expect-error for options1, nested is required
    expect(_t('selectWithNested', { value: 'option1' })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested" was not provided to the string "undefined""`,
    );
    expect(_t('selectWithNested', { value: 'option1', nested: 'nestedText' })).toBe('text text1 nestedText text');
    expect(_t('selectWithNested', { value: 'option2' })).toBe('text text2 text');
  });

  test('select with other nested', async () => {
    const _t = await getTranslator('en');
    //@ts-expect-error for option1, nested1 is required
    expect(_t('selectWithOtherNested', { value: 'option1' })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested1" was not provided to the string "undefined""`,
    );
    expect(_t('selectWithOtherNested', { value: 'option1', nested1: 'n1' })).toBe('text text1 n1 text');
    //@ts-expect-error for option1, nested1 is required
    expect(_t('selectWithOtherNested', { value: 'option1', nested3: 'n3' })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested1" was not provided to the string "undefined""`,
    );
    expect(_t('selectWithOtherNested', { value: 'option1', nested1: 'n1', nested2: 'n2', nested3: 'n3' })).toBe('text text1 n1 text');

    //@ts-expect-error for option2, nested2 is required
    expect(_t('selectWithOtherNested', { value: 'option2' })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested2" was not provided to the string "undefined""`,
    );
    expect(_t('selectWithOtherNested', { value: 'option2', nested2: 'n2' })).toBe('text text2 n2 text');
    //@ts-expect-error for option2, nested2 is required
    expect(_t('selectWithOtherNested', { value: 'option2', nested3: 'n3' })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested2" was not provided to the string "undefined""`,
    );
    expect(_t('selectWithOtherNested', { value: 'option2', nested1: 'n1', nested2: 'n2', nested3: 'n3' })).toBe('text text2 n2 text');

    // @ts-expect-error for other, nested3 is required
    expect(_t('selectWithOtherNested', { value: 'foo' as OtherString })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested3" was not provided to the string "undefined""`,
    );
    expect(_t('selectWithOtherNested', { value: 'foo' as OtherString, nested3: 'n3' })).toBe('text text3 n3 text');
    // @ts-expect-error for other, nested3 is required
    expect(_t('selectWithOtherNested', { value: 'foo' as OtherString, nested1: 'n1' })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested3" was not provided to the string "undefined""`,
    );
    expect(_t('selectWithOtherNested', { value: 'foo' as OtherString, nested1: 'n1', nested2: 'n2', nested3: 'n3' })).toBe(
      'text text3 n3 text',
    );

    // @ts-expect-error for string, all nested args are required
    expect(_t('selectWithOtherNested', { value: 'foo' as string })).toMatchInlineSnapshot(
      `"Wrong format: Error: The intl string context variable "nested3" was not provided to the string "undefined""`,
    );
    // @ts-expect-error for string, all nested args are required
    expect(_t('selectWithOtherNested', { value: 'foo' as string, nested3: 'n3' })).toBe('text text3 n3 text');
    expect(_t('selectWithOtherNested', { value: 'foo' as string, nested1: 'n1', nested2: 'n2', nested3: 'n3' })).toBe('text text3 n3 text');

    expectTypeOf(_t.dynamic<'nested.key2' | 'selectWithOtherNested'>).parameters.toEqualTypeOf<
      [
        id: 'nested.key2' | 'selectWithOtherNested',
        ...args: [
          values:
            | { value2: ICUArgument; value: 'option1'; nested1: ICUArgument }
            | { value2: ICUArgument; value: 'option2'; nested2: ICUArgument }
            | { value2: ICUArgument; value: OtherString; nested3: ICUArgument }
            | {
                value2: ICUArgument;
                value: (string & {}) | 'option1' | 'option2';
                nested1: ICUArgument;
                nested2: ICUArgument;
                nested3: ICUArgument;
              },
          options?: GetTranslatorOptions,
        ],
      ]
    >();
  });
});

describe('escape sequences', () => {
  test('escape single', async () => {
    const _t = await getTranslator('en');
    expect(_t('escapeSingle')).toBe('text {word1} {word2}');
  });

  test('escape pair', async () => {
    const _t = await getTranslator('en');
    expect(_t('escapePair')).toBe('text {word1} {word2}');
  });

  test('escape escaped', async () => {
    const _t = await getTranslator('en');
    expect(_t('escapeEscaped', { word1: 'text1' })).toBe(`text 'text1`);
  });

  test('escape non escapable', async () => {
    const _t = await getTranslator('en');
    expect(_t('escapeNonEscapable', { word1: 'text1' })).toBe(`text ' text text1`);
  });

  test('escape sharp in plural', async () => {
    const _t = await getTranslator('en');
    expect(_t('escapeSharpInPlural', { value: 1 })).toBe(`text # times {word}`);
  });

  test('escape sharp outside plural', async () => {
    const _t = await getTranslator('en');
    expect(_t('escapeSharpOutsidePlural', { word: 'text' })).toBe(`text '# times text`);
  });
});

describe('provided args', () => {
  test('provided args directly', async () => {
    const { getTranslator } = createTranslator({
      sourceDictionary: {
        foo: '{foo}',
        bar: '{bar}',
        baz: '{foo} and {bar}',
      } as const,
      sourceLocale: 'en',
      provideArgs: { bar: 'x' },
    });

    const t = await getTranslator('en');
    expectTypeOf(t<'foo'>).parameters.toEqualTypeOf<[key: 'foo', values: { foo: ICUArgument }, options?: GetTranslatorOptions]>();
    expectTypeOf(t<'bar'>).parameters.toEqualTypeOf<[key: 'bar', values?: { bar?: ICUArgument }, options?: GetTranslatorOptions]>();
    expectTypeOf(t<'baz'>).parameters.toEqualTypeOf<
      [key: 'baz', values: { foo: ICUArgument; bar?: ICUArgument }, options?: GetTranslatorOptions]
    >();

    expect(t('bar')).toBe('x');
    expect(t('bar', { bar: 'y' })).toBe('y');
  });

  test('provided args subscribed', async () => {
    let value = 0;

    const { getTranslator } = createTranslator({
      sourceDictionary: {
        foo: '{value}',
      } as const,
      sourceLocale: 'en',
      provideArgs: {
        value: {
          get: () => value,
          subscribe: () => () => undefined,
        },
      },
    });

    const t = await getTranslator('en');
    expect(t('foo')).toBe('0');

    value = 1;
    // listener?.();
    expect(t('foo')).toBe('1');
  });

  test('override icu types', () => {
    type Config = { ICUNumberArgument: 'mynum'; ICUDateArgument: 'mydate'; ICUArgument: 'myarg' };
    expectTypeOf<GetICUArgs<'{var, number}', Config>>().toEqualTypeOf<{ var: 'mynum' }>();
    expectTypeOf<GetICUArgs<'{var, date}', Config>>().toEqualTypeOf<{ var: 'mydate' }>();
    expectTypeOf<GetICUArgs<'{var}', Config>>().toEqualTypeOf<{ var: 'myarg' }>();
  });
});
