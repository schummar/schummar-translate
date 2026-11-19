import type { Dictionary } from '../src';
import { expectTypeOf, test } from 'vite-plus/test';

const en = {
  greeting: 'Hello {name}',
  nested: { remove: 'Delete this {type}' },
  list: ['one {a}', 'two {b}'],
} as const;

test('correct translation', () => {
  void ({
    greeting: 'Hallo {name}',
    nested: { remove: '{type} löschen' },
    list: ['eins {a}', 'zwei {b}'],
  } as const satisfies Dictionary<typeof en>);

  expectTypeOf<Dictionary<typeof en>>().toEqualTypeOf<{
    readonly greeting: string;
    readonly nested: { readonly remove: string };
    readonly list: readonly string[];
  }>();
});

test('wrong keys', () => {
  // @ts-expect-error missing key
  void ({ nested: { remove: 'Löschen' }, list: [] } as const satisfies Dictionary<typeof en>);

  void ({
    greeting: 'Hallo',
    // @ts-expect-error missing nested key
    nested: {},
    list: [],
  } as const satisfies Dictionary<typeof en>);

  void ({
    greeting: 'Hallo',
    nested: { remove: 'Löschen' },
    list: [],
    // @ts-expect-error extra key
    extra: 'Extra',
  } as const satisfies Dictionary<typeof en>);

  void ({
    greeting: 'Hallo',
    // @ts-expect-error extra nested key
    nested: { remove: 'Löschen', extra: 'Extra' },
    list: [],
  } as const satisfies Dictionary<typeof en>);
});
