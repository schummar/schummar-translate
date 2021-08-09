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

const test = anyTest as TestInterface<ReturnType<typeof createTranslator>>;

test.beforeEach((t) => {
  t.context = createTranslator({
    sourceDictionary: dictEn,
    sourceLocale: 'en',
    dicts: { de: dictDe, es: dictEs },
    fallback: () => '-',
    placeholder: (_id, st) => st.replace(/./g, '.'),
  });
});

function App({ children }: { children?: React.ReactNode }) {
  const [locale, setLocale] = useState('en');
  const toggleLocale = () => setLocale((l) => (l === 'en' ? 'de' : l === 'de' ? 'es' : 'en'));

  return (
    <TranslationContextProvider locale={locale}>
      <div data-testid="div" onClick={toggleLocale}>
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
      test.serial(`${name} with ${i === 0 ? 'translator' : 'hook'}`, (t) => {
        function WithHook() {
          const _t = t.context.useTranslator();
          return <>{_t(id, ...([values, options] as any))}</>;
        }

        let element;
        if (i === 0) {
          element = t.context.t(id, ...([values, options] as any));
        } else {
          element = <WithHook />;
        }

        render(<App>{element}</App>);
        const div = screen.getByTestId('div');
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

test.serial('format with translator', async (t) => {
  render(<App>{t.context.t.format('{date, date}', { date })}</App>);
  const div = screen.getByTestId('div');
  t.is(div.textContent, '1/1/2000');

  fireEvent.click(div);
  t.is(div.textContent, '1.1.2000');
});

test.serial('format with hook', async (t) => {
  function WithHook() {
    const _t = t.context.useTranslator();
    return <>{_t.format('{date, date}', { date })}</>;
  }

  render(
    <App>
      <WithHook />
    </App>,
  );
  const div = screen.getByTestId('div');
  t.is(div.textContent, '1/1/2000');

  fireEvent.click(div);
  t.is(div.textContent, '1.1.2000');
});
