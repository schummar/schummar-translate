import { mergeDicts } from '../src';

export const wait = async (ticks = 1): Promise<void> => {
  for (let i = 0; i < ticks; i++) await new Promise((r) => setImmediate(r));
};

export const dictEn1 = {
  key1: 'key1:en',
  nested: { key2: 'key2:en {value2}' },
  arr: ['one {pOne}', 'two {pTwo}'],
  escape: `
    This is not an interpolation: '{word}
    These are not interpolations: '{word1} {word2}'
    '<notATag>
    '<notATag>hello</notATag>'
    This '{isn''t}' obvious.
    {param}
    `,
  escape1: `'a{b}c'`,
} as const;
export const dictEn2 = {
  nested: {
    key3: 'key3:en {number, number} {plural, plural, one{one} other{other} } {selectordinal, selectordinal, one{#st} two{#nd} few{#rd} other{#th} } {date, date} {time, time,short}',
  },
  key4: 'key4:en',
} as const;
export const dictEn = mergeDicts(dictEn1, dictEn2);

export const dictDe1 = {
  key1: 'key1:de',
  nested: { key2: 'key2:de {value2}' },
  arr: ['eins {pOne}', 'zwei {pTwo}'],
};
export const dictDe2 = {
  nested: {
    key3: 'key3:de {number, number} {plural, plural, one{eins} other{andere} } {selectordinal, selectordinal, one{#ste} other{#te} } {date, date} {time, time, short}',
  },
};
export const dictDe = mergeDicts(dictDe1, dictDe2);

export const dictEs = {};
