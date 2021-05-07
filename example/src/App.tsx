import React, { useContext, useMemo, useState } from 'react';
import { TranslationContext } from '../../react';
import './App.css';
import { f, fDate, fMoney, t, tFallback, useFormat } from './translator';

function App() {
  const [locale, setLocale] = useState(
    typeof window === 'object' && 'navigator' in window ? window.navigator.language.slice(0, 2) : undefined,
  );
  const context = useMemo(() => ({ locale }), [locale]);

  return (
    <TranslationContext.Provider value={context}>
      <Content setLocale={setLocale} />
    </TranslationContext.Provider>
  );
}

export default App;

function Content({ setLocale }: { setLocale: (locale: string) => void }) {
  const { locale } = useContext(TranslationContext);
  const formatter = useFormat();

  return (
    <div>
      <div style={{ display: 'grid', gridAutoFlow: 'column', gap: 10, justifyContent: 'start' }}>
        {['de', 'en'].map((x) => (
          <span key={x} onClick={() => setLocale(x)}>
            {locale === x ? <b>{x}</b> : x}
          </span>
        ))}
      </div>
      <div>{t('flatKey', { count: 5, no: 'NO', one: 'ONE', other: new Date() })}</div>
      <div>{tFallback('foo', { fallback: <b>bar</b> })}</div>
      <div>{t('anotherKey')}</div>
      <div>{t('nestedKey.nestedKey', { foo: new Date() })}</div>
      <div>{t('nestedKey.anotherNestedKey')}</div>
      <div>{formatter('{price, number, ::currency/EUR}', { price: 100 })}</div>
      <div>{fMoney(100)}</div>
      <div>{formatter('{amount, number, ::.0000}', { amount: 1.23 })}</div>
      <div>{formatter('{date, date, ::yyyyMMddHHmm}', { date: new Date() })}</div>
      <div>{f('{date, date, ::yyyyMMddHHmm}', { date: new Date() })}</div>
      <div>{fDate(new Date())}</div>
    </div>
  );
}
