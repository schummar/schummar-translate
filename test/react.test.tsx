import { fireEvent, render, screen } from '@testing-library/react';
import React, { ReactNode, useState } from 'react';
import { beforeEach, expect, test } from 'vitest';
import { FlattenDict } from '../src';
import { createTranslator, HookTranslator, MaybePromise, TranslationContextProvider } from '../src/react';
import { dictDe, dictEn, dictEs, wait } from './_helpers';

type D = FlattenDict<typeof dictEn>;

let { t, useTranslator } = createTranslator({
  sourceDictionary: dictEn,
  sourceLocale: 'en',
  dicts: { de: dictDe, es: dictEs },
  fallback: () => '-',
  dateTimeFormatOptions: { dateStyle: 'medium', timeStyle: 'medium' },
});

beforeEach(() => {
  ({ t, useTranslator } = createTranslator({
    sourceDictionary: dictEn,
    sourceLocale: 'en',
    dicts: { de: dictDe, es: dictEs },
    fallback: () => '-',
    dateTimeFormatOptions: { dateStyle: 'medium', timeStyle: 'medium' },
  }));
});

function App({
  id,
  locales = ['en', 'de', 'es'],
  initialLocale = locales[0],
  children,
}: {
  id: string;
  locales?: string[];
  initialLocale?: string;
  children?: React.ReactNode;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const toggleLocale = () => setLocale((l) => locales[(l ? locales.indexOf(l) + 1 : 0) % locales.length]);

  return (
    <TranslationContextProvider locale={locale}>
      <div data-testid={id} onClick={toggleLocale}>
        {children}
      </div>
    </TranslationContextProvider>
  );
}

function HookWrapper({
  useTranslator,
  renderFn,
}: {
  useTranslator: () => HookTranslator<D>;
  renderFn: (t: HookTranslator<D>) => ReactNode;
}) {
  const t = useTranslator();
  const value = renderFn(t);
  return <>{value instanceof Array ? value.join('') : value}</>;
}

const date = new Date(2000, 1, 2, 3, 4, 5);

const forCases = (
  name: string,
  renderFn: (t: HookTranslator<D>) => ReactNode,
  assertionFn: (div: HTMLElement) => MaybePromise<void>,
  { locales, initialLocale }: { locales?: string[]; initialLocale?: string } = {},
) => {
  for (const i of [0, 1]) {
    const title = `${name} with ${i === 0 ? 'translator' : 'hook'}`;

    test(title, () => {
      let element;
      if (i === 0) {
        element = renderFn(t as any);
      } else {
        element = <HookWrapper useTranslator={useTranslator} renderFn={renderFn} />;
      }

      render(
        <App id={title} locales={locales} initialLocale={initialLocale}>
          {element}
        </App>,
      );
      const div = screen.getByTestId(title);
      return assertionFn(div);
    });
  }
};

forCases(
  'simple',
  () => t('key1'),
  async (div) => {
    expect(div.textContent).toBe('key1:en');

    fireEvent.click(div);
    await wait(1);
    expect(div.textContent).toBe('key1:de');
  },
);

forCases(
  'with value',
  () => t('nested.key2', { value2: 'v2' }),
  async (div) => {
    expect(div.textContent).toBe('key2:en v2');

    fireEvent.click(div);
    await wait(1);
    expect(div.textContent).toBe('key2:de v2');
  },
);

forCases(
  'with complex values',
  () => t('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date }),
  async (div) => {
    expect(div.textContent).toBe('key3:en 1 one 1st 2/2/2000 3:04 AM');

    fireEvent.click(div);
    expect(div.textContent).toBe('key3:de 1 eins 1te 2.2.2000 03:04');
  },
);

forCases(
  'missing key global fallback',
  () => t('key4'),
  async (div) => {
    expect(div.textContent).toBe('key4:en');

    fireEvent.click(div);
    expect(div.textContent).toBe('-');
  },
);

forCases(
  'missing key local fallback',
  () => t('key4', undefined, { fallback: '--' }),
  async (div) => {
    expect(div.textContent).toBe('key4:en');

    fireEvent.click(div);
    expect(div.textContent).toBe('--');
  },
);

forCases(
  'switching twice',
  () => t('key1'),
  async (div) => {
    expect(div.textContent).toBe('key1:en');

    fireEvent.click(div);
    expect(div.textContent).toBe('key1:de');

    fireEvent.click(div);
    expect(div.textContent).toBe('-');
  },
);

forCases(
  'format',
  () => t.format('{date, date}', { date }),
  (div) => {
    expect(div.textContent).toBe('2/2/2000');

    fireEvent.click(div);
    expect(div.textContent).toBe('2.2.2000');
  },
);

forCases(
  'locale',
  () => t.locale,
  async (div) => {
    expect(div.innerHTML).toBe('en');

    fireEvent.click(div);
    await wait(1);
    expect(div.innerHTML).toBe('de');
  },
);

forCases(
  'dateTimeFormat',
  () => t.dateTimeFormat(date, { dateStyle: 'short', timeStyle: 'short' }),
  async (div) => {
    expect(div.textContent).toBe('2/2/00, 3:04 AM');

    fireEvent.click(div);
    expect(div.textContent).toBe('02.02.00, 03:04');
  },
);

forCases(
  'dateTimeFormat default options',
  () => t.dateTimeFormat(date),
  async (div) => {
    expect(div.textContent).toBe('Feb 2, 2000, 3:04:05 AM');

    fireEvent.click(div);
    expect(div.textContent).toBe('02.02.2000, 03:04:05');
  },
);

forCases(
  'displayNames',
  () => t.displayNames('de', { type: 'language' }),
  async (div) => {
    expect(div.textContent).toBe('German');

    fireEvent.click(div);
    expect(div.textContent).toBe('Deutsch');
  },
);

forCases(
  'listFormat',
  () => t.listFormat(['a', 'b', 'c'], { type: 'conjunction' }),
  async (div) => {
    expect(div.textContent).toBe('a, b, and c');

    fireEvent.click(div);
    expect(div.textContent).toBe('a, b und c');
  },
);

forCases(
  'numberFormat',
  () => t.numberFormat(12.34, { maximumFractionDigits: 1 }),
  async (div) => {
    expect(div.textContent).toBe('12.3');

    fireEvent.click(div);
    expect(div.textContent).toBe('12,3');
  },
);

forCases(
  'pluralRules',
  () => t.pluralRules(4),
  async (div) => {
    expect(div.textContent).toBe('other');

    fireEvent.click(div);
    expect(div.textContent).toBe('few');
  },
  { locales: ['en', 'pl'] },
);

forCases(
  'relativeTimeFormat',
  () => t.relativeTimeFormat(-30, 'seconds'),
  async (div) => {
    expect(div.textContent).toBe('30 seconds ago');

    fireEvent.click(div);
    expect(div.textContent).toBe('vor 30 Sekunden');
  },
);

forCases(
  'match locales',
  () => t('key1'),
  (div) => {
    expect(div.textContent).toBe('key1:en');
  },
  { initialLocale: 'en-US' },
);

test('arr with component', async () => {
  render(<App id={'arr with component'}>{t('arr', { pOne: 'p1', pTwo: 'p2' }, { component: 'div' })}</App>);
  const div = screen.getByTestId('arr with component');
  expect(div.innerHTML).toBe('<div>one p1</div><div>two p2</div>');

  fireEvent.click(div);
  await wait(1);
  expect(div.innerHTML).toBe('<div>eins p1</div><div>zwei p2</div>');
});

test('arr with hook', async () => {
  render(
    <App id={'arr with hook'}>
      <HookWrapper useTranslator={useTranslator} renderFn={(t) => t('arr', { pOne: 'p1', pTwo: 'p2' }).join(', ')} />
    </App>,
  );
  const div = screen.getByTestId('arr with hook');
  expect(div.innerHTML).toBe('one p1, two p2');

  fireEvent.click(div);
  await wait(1);
  expect(div.innerHTML).toBe('eins p1, zwei p2');
});

test('render', async () => {
  let renderCount = 0;

  const Comp = () => {
    const [, setI] = useState(0);
    return (
      <div onClick={() => setI((i) => i + 1)}>
        <App id={'render'} locales={['en', 'de', 'de']}>
          {t.render((t) => {
            renderCount++;
            return new Intl.DateTimeFormat(t.locale, { dateStyle: 'full' }).format(date);
          }, [])}
        </App>
        ,
      </div>
    );
  };

  render(<Comp />);
  const div = screen.getByTestId('render');
  expect(div.innerHTML).toBe('Wednesday, February 2, 2000');

  fireEvent.click(div);
  await wait(1);
  expect(div.innerHTML).toBe('Mittwoch, 2. Februar 2000');

  fireEvent.click(div);
  await wait(1);
  expect(renderCount).toBe(2);
});

test('placeholder', async () => {
  const { t: _t } = createTranslator<typeof dictEn>({
    sourceLocale: 'en',
    dicts: { en: dictEn, de: async () => dictDe },
    fallback: () => '-',
    placeholder: (id, st) => (typeof st === 'string' ? st.replace(/./g, '.') : '...'),
  });

  render(<App id={'placeholder'}>{_t('key1')}</App>);
  const div = screen.getByTestId('placeholder');
  expect(div.textContent).toBe('key1:en');

  fireEvent.click(div);
  expect(div.textContent).toBe('.......');

  await wait(2);
  expect(div.textContent).toBe('key1:de');
});
