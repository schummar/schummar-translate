import { fireEvent, render, screen } from '@testing-library/react';
import anyTest, { ExecutionContext, TestInterface } from 'ava';
import React, { ReactNode, useState } from 'react';
import { FlattenDict } from '../src';
import { createTranslator, HookTranslator, MaybePromise, TranslationContextProvider } from '../src/react';
import { dictDe, dictEn, dictEs, wait } from './_helpers';

type D = FlattenDict<typeof dictEn>;

const createContext = () =>
  createTranslator({
    sourceDictionary: dictEn,
    sourceLocale: 'en',
    dicts: { de: dictDe, es: dictEs },
    fallback: () => '-',
    dateTimeFormatOptions: { dateStyle: 'medium', timeStyle: 'medium' },
  });
const test = anyTest as TestInterface<ReturnType<typeof createContext>>;

test.beforeEach((t) => {
  t.context = createContext();
});

function App({ id, locales = ['en', 'de', 'es'], children }: { id: string; locales?: string[]; children?: React.ReactNode }) {
  const [locale, setLocale] = useState(locales[0]);
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
  assertionFn: (t: ExecutionContext, div: HTMLElement) => MaybePromise<void>,
  { locales }: { locales?: string[] } = {},
) => {
  for (const i of [0, 1]) {
    test(`${name} with ${i === 0 ? 'translator' : 'hook'}`, (t) => {
      let element;
      if (i === 0) {
        element = renderFn(t.context.t as any);
      } else {
        element = <HookWrapper useTranslator={t.context.useTranslator} renderFn={renderFn} />;
      }

      render(
        <App id={t.title} locales={locales}>
          {element}
        </App>,
      );
      const div = screen.getByTestId(t.title);
      return assertionFn(t, div);
    });
  }
};

forCases(
  'simple',
  (t) => t('key1'),
  async (t, div) => {
    t.is(div.textContent, 'key1:en');

    fireEvent.click(div);
    await wait(1);
    t.is(div.textContent, 'key1:de');
  },
);

forCases(
  'with value',
  (t) => t('nested.key2', { value2: 'v2' }),
  async (t, div) => {
    t.is(div.textContent, 'key2:en v2');

    fireEvent.click(div);
    await wait(1);
    t.is(div.textContent, 'key2:de v2');
  },
);

forCases(
  'with complex values',
  (t) => t('nested.key3', { number: 1, plural: 1, selectordinal: 1, date, time: date }),
  async (t, div) => {
    t.is(div.textContent, 'key3:en 1 one 1st 2/2/2000 3:04 AM');

    fireEvent.click(div);
    t.is(div.textContent, 'key3:de 1 eins 1te 2.2.2000 03:04');
  },
);

forCases(
  'missing key global fallback',
  (t) => t('key4'),
  async (t, div) => {
    t.is(div.textContent, 'key4:en');

    fireEvent.click(div);
    t.is(div.textContent, '-');
  },
);

forCases(
  'missing key local fallback',
  (t) => t('key4', undefined, { fallback: '--' }),
  async (t, div) => {
    t.is(div.textContent, 'key4:en');

    fireEvent.click(div);
    t.is(div.textContent, '--');
  },
);

forCases(
  'switching twice',
  (t) => t('key1'),
  async (t, div) => {
    t.is(div.textContent, 'key1:en');

    fireEvent.click(div);
    t.is(div.textContent, 'key1:de');

    fireEvent.click(div);
    t.is(div.textContent, '-');
  },
);

forCases(
  'format',
  (t) => t.format('{date, date}', { date }),
  (t, div) => {
    t.is(div.textContent, '2/2/2000');

    fireEvent.click(div);
    t.is(div.textContent, '2.2.2000');
  },
);

forCases(
  'locale',
  (t) => t.locale,
  async (t, div) => {
    t.is(div.innerHTML, 'en');

    fireEvent.click(div);
    await wait(1);
    t.is(div.innerHTML, 'de');
  },
);

forCases(
  'dateTimeFormat',
  (t) => t.dateTimeFormat(date, { dateStyle: 'short', timeStyle: 'short' }),
  async (t, div) => {
    t.is(div.textContent, '2/2/00, 3:04 AM');

    fireEvent.click(div);
    t.is(div.textContent, '02.02.00, 03:04');
  },
);

forCases(
  'dateTimeFormat default options',
  (t) => t.dateTimeFormat(date),
  async (t, div) => {
    t.is(div.textContent, 'Feb 2, 2000, 3:04:05 AM');

    fireEvent.click(div);
    t.is(div.textContent, '02.02.2000, 03:04:05');
  },
);

forCases(
  'displayNames',
  (t) => t.displayNames('de', { type: 'language' }),
  async (t, div) => {
    t.is(div.textContent, 'German');

    fireEvent.click(div);
    t.is(div.textContent, 'Deutsch');
  },
);

forCases(
  'listFormat',
  (t) => t.listFormat(['a', 'b', 'c'], { type: 'conjunction' }),
  async (t, div) => {
    t.is(div.textContent, 'a, b, and c');

    fireEvent.click(div);
    t.is(div.textContent, 'a, b und c');
  },
);

forCases(
  'numberFormat',
  (t) => t.numberFormat(12.34, { maximumFractionDigits: 1 }),
  async (t, div) => {
    t.is(div.textContent, '12.3');

    fireEvent.click(div);
    t.is(div.textContent, '12,3');
  },
);

forCases(
  'pluralRules',
  (t) => t.pluralRules(4),
  async (t, div) => {
    t.is(div.textContent, 'other');

    fireEvent.click(div);
    t.is(div.textContent, 'few');
  },
  { locales: ['en', 'pl'] },
);

forCases(
  'relativeTimeFormat',
  (t) => t.relativeTimeFormat(-30, 'seconds'),
  async (t, div) => {
    t.is(div.textContent, '30 seconds ago');

    fireEvent.click(div);
    t.is(div.textContent, 'vor 30 Sekunden');
  },
);

test('arr with component', async (t) => {
  render(<App id={t.title}>{t.context.t('arr', { pOne: 'p1', pTwo: 'p2' }, { component: 'div' })}</App>);
  const div = screen.getByTestId(t.title);
  t.is(div.innerHTML, '<div>one p1</div><div>two p2</div>');

  fireEvent.click(div);
  await wait(1);
  t.is(div.innerHTML, '<div>eins p1</div><div>zwei p2</div>');
});

test('arr with hook', async (t) => {
  render(
    <App id={t.title}>
      <HookWrapper useTranslator={t.context.useTranslator} renderFn={(t) => t('arr', { pOne: 'p1', pTwo: 'p2' }).join(', ')} />
    </App>,
  );
  const div = screen.getByTestId(t.title);
  t.is(div.innerHTML, 'one p1, two p2');

  fireEvent.click(div);
  await wait(1);
  t.is(div.innerHTML, 'eins p1, zwei p2');
});

test('render', async (t) => {
  let renderCount = 0;

  const Comp = () => {
    const [, setI] = useState(0);
    return (
      <div onClick={() => setI((i) => i + 1)}>
        <App id={t.title} locales={['en', 'de', 'de']}>
          {t.context.t.render((locale) => {
            renderCount++;
            return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date);
          }, [])}
        </App>
        ,
      </div>
    );
  };

  render(<Comp />);
  const div = screen.getByTestId(t.title);
  t.is(div.innerHTML, 'Wednesday, February 2, 2000');

  fireEvent.click(div);
  await wait(1);
  t.is(div.innerHTML, 'Mittwoch, 2. Februar 2000');

  fireEvent.click(div);
  await wait(1);
  t.is(renderCount, 2);
});

test('placeholder', async (t) => {
  const { t: _t } = createTranslator<typeof dictEn>({
    sourceLocale: 'en',
    dicts: { en: dictEn, de: async () => dictDe },
    fallback: () => '-',
    placeholder: (id, st) => (typeof st === 'string' ? st.replace(/./g, '.') : '...'),
  });

  render(<App id={t.title}>{_t('key1')}</App>);
  const div = screen.getByTestId(t.title);
  t.is(div.textContent, 'key1:en');

  fireEvent.click(div);
  t.is(div.textContent, '.......');

  await wait(1);
  t.is(div.textContent, 'key1:de');
});
