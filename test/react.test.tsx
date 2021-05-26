import { fireEvent, render, screen } from '@testing-library/react';
import test, { ExecutionContext } from 'ava';
import React, { useState } from 'react';
import { Values } from '../src/internalTypes';
import { createTranslator, TranslationContextProvider } from '../src/react';
import { UseTranslatorOptions } from '../src/react/internalTypes';
import { DeepValue, FlatKeys, MaybePromise } from '../src/types';
import { dictDe, dictEn, wait } from './_helpers';

const { useTranslator, t: _t } = createTranslator({
  sourceDictionary: dictEn,
  sourceLocale: 'en',
  dicts: { de: dictDe },
  fallback: () => '-',
  placeholder: (_id, st) => st.replace(/./g, '.'),
});

function App({ children }: { children?: React.ReactNode }) {
  const [locale, setLocale] = useState('en');
  const toggleLocale = () => setLocale((l) => (l === 'en' ? 'de' : 'en'));

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
    function WithHook() {
      const t = useTranslator();
      return <>{t(id, ...([values, options] as any))}</>;
    }

    const cases = {
      translator: _t(id, ...([values, options] as any)),
      hook: <WithHook />,
    };

    for (const [type, element] of Object.entries(cases)) {
      test.serial(`${name} with ${type}`, (t) => {
        render(<App>{element}</App>);
        const div = screen.getByTestId('div');
        return fn(t, div);
      });
    }
  };

forCases('key1', undefined)('simple', async (t, div) => {
  t.is(div.textContent, '.......');

  await wait(1);
  t.is(div.textContent, 'key1:en');

  fireEvent.click(div);
  await wait(1);
  t.is(div.textContent, 'key1:de');
});

forCases('nested.key2', { value2: 'v2' })('with value', async (t, div) => {
  t.is(div.textContent, '..........');

  await wait(1);
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
  t.is(div.textContent, '...');

  await wait(1);
  t.is(div.textContent, 'key3:en 1 one 1st 1/1/2000 12:00 AM');

  fireEvent.click(div);
  await wait(1);
  t.is(div.textContent, 'key3:de 1 eins 1te 1.1.2000 00:00');
});

forCases('key4')('missing key global fallback', async (t, div) => {
  t.is(div.textContent, '.......');

  await wait(1);
  t.is(div.textContent, 'key4:en');

  fireEvent.click(div);
  await wait(1);
  t.is(div.textContent, '-');
});

forCases('key4', undefined, { fallback: '--' })('missing key local fallback', async (t, div) => {
  t.is(div.textContent, '.......');

  await wait(1);
  t.is(div.textContent, 'key4:en');

  fireEvent.click(div);
  await wait(1);
  t.is(div.textContent, '--');
});

test.serial('format with translator', async (t) => {
  render(<App>{_t.format('{date, date}', { date })}</App>);
  const div = screen.getByTestId('div');
  t.is(div.textContent, '1/1/2000');

  fireEvent.click(div);
  t.is(div.textContent, '1.1.2000');
});

test.serial('format with hook', async (t) => {
  function WithHook() {
    const t = useTranslator();
    return <>{t.format('{date, date}', { date })}</>;
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
