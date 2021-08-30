import { fireEvent, render, screen } from '@testing-library/react';
import anyTest, { ExecutionContext, TestInterface } from 'ava';
import React, { useState } from 'react';
import {
  createTranslator,
  DeepValue,
  FlatKeys,
  MaybePromise,
  TranslationContextProvider,
  UseTranslatorOptions,
  Values,
} from '../src/react';
import { dictDe, dictEn, dictEs, wait } from './_helpers';

const createContext = () =>
  createTranslator({
    sourceDictionary: dictEn,
    sourceLocale: 'en',
    dicts: { de: dictDe, es: dictEs },
    fallback: () => '-',
    placeholder: (_id, st) => st.replace(/./g, '.'),
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

type D = typeof dictEn;
const forCases =
  <K extends FlatKeys<D>>(id: K, ...[values, options]: Values<DeepValue<D, K>, UseTranslatorOptions>) =>
  (name: string, fn: (t: ExecutionContext, div: HTMLElement) => MaybePromise<void>) => {
    for (let i = 0; i < 2; i++) {
      test(`${name} with ${i === 0 ? 'translator' : 'hook'}`, (t) => {
        function WithHook() {
          const _t = t.context.useTranslator();
          const value = _t(id, ...([values, options] as any));
          return <>{value instanceof Array ? value.join('') : value}</>;
        }

        let element;
        if (i === 0) {
          element = t.context.t(id, ...([values, options] as any));
        } else {
          element = <WithHook />;
        }

        render(<App id={t.title}>{element}</App>);
        const div = screen.getByTestId(t.title);
        return fn(t, div);
      });
    }
  };

forCases('key1', undefined)('simple', async (t, div) => {
  t.is(div.textContent, 'key1:en');

  fireEvent.click(div);
  await wait(1);
  t.is(div.textContent, 'key1:de');
});

forCases('nested.key2', { value2: 'v2' })('with value', async (t, div) => {
  t.is(div.textContent, 'key2:en v2');

  fireEvent.click(div);
  await wait(1);
  t.is(div.textContent, 'key2:de v2');
});

const date = new Date(2000, 0, 1, 0, 0, 0, 0);
forCases(
  'nested.key3',
  { number: 1, plural: 1, selectordinal: 1, date, time: date },
  { placeholder: '...' },
)('with complex values', async (t, div) => {
  t.is(div.textContent, 'key3:en 1 one 1st 1/1/2000 12:00 AM');

  fireEvent.click(div);
  t.is(div.textContent, '...');

  await wait(1);
  t.is(div.textContent, 'key3:de 1 eins 1te 1.1.2000 00:00');
});

forCases('key4')('missing key global fallback', async (t, div) => {
  t.is(div.textContent, 'key4:en');

  fireEvent.click(div);
  t.is(div.textContent, '.......');

  await wait(1);
  t.is(div.textContent, '-');
});

forCases('key4', undefined, { fallback: '--' })('missing key local fallback', async (t, div) => {
  t.is(div.textContent, 'key4:en');

  fireEvent.click(div);
  t.is(div.textContent, '.......');

  await wait(1);
  t.is(div.textContent, '--');
});

forCases('key1', undefined, { placeholder: '...' })('switching twice', async (t, div) => {
  t.is(div.textContent, 'key1:en');

  fireEvent.click(div);
  t.is(div.textContent, '...');
  await wait(1);
  t.is(div.textContent, 'key1:de');

  fireEvent.click(div);
  t.is(div.textContent, '...');
  await wait(1);
  t.is(div.textContent, '-');
});

test('format with translator', async (t) => {
  render(<App id={t.title}>{t.context.t.format('{date, date}', { date })}</App>);
  const div = screen.getByTestId(t.title);
  t.is(div.textContent, '1/1/2000');

  fireEvent.click(div);
  t.is(div.textContent, '1.1.2000');
});

test('format with hook', async (t) => {
  function WithHook() {
    const _t = t.context.useTranslator();
    return <>{_t.format('{date, date}', { date })}</>;
  }

  render(
    <App id={t.title}>
      <WithHook />
    </App>,
  );
  const div = screen.getByTestId(t.title);
  t.is(div.textContent, '1/1/2000');

  fireEvent.click(div);
  t.is(div.textContent, '1.1.2000');
});

test('arr with component', async (t) => {
  render(<App id={t.title}>{t.context.t('arr', { pOne: 'p1', pTwo: 'p2' }, { component: 'div' })}</App>);
  const div = screen.getByTestId(t.title);
  t.is(div.innerHTML, '<div>one p1</div><div>two p2</div>');

  fireEvent.click(div);
  await wait(1);
  t.is(div.innerHTML, '<div>eins p1</div><div>zwei p2</div>');
});

test('arr with hook', async (t) => {
  function WithHook() {
    const _t = t.context.useTranslator();
    const arr = _t('arr', { pOne: 'p1', pTwo: 'p2' });
    return <>{arr[arr.length - 1]}</>;
  }

  render(
    <App id={t.title}>
      <WithHook />
    </App>,
  );
  const div = screen.getByTestId(t.title);
  t.is(div.innerHTML, 'two p2');

  fireEvent.click(div);
  await wait(1);
  t.is(div.innerHTML, 'zwei p2');
});

test('locale', async (t) => {
  function WithHook() {
    const _t = t.context.useTranslator();
    return <>{_t.locale}</>;
  }

  render(
    <App id={t.title}>
      <WithHook />
    </App>,
  );
  const div = screen.getByTestId(t.title);
  t.is(div.innerHTML, 'en');

  fireEvent.click(div);
  await wait(1);
  t.is(div.innerHTML, 'de');
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
  t.is(div.innerHTML, 'Saturday, January 1, 2000');

  fireEvent.click(div);
  await wait(1);
  t.is(div.innerHTML, 'Samstag, 1. Januar 2000');

  fireEvent.click(div);
  await wait(1);
  t.is(renderCount, 2);
});
