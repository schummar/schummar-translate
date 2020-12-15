import React, { useContext, useMemo, useState } from 'react';
import { TranslationContext } from '../..';
import './App.css';
import { t } from './translator';

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

  return (
    <div>
      <div style={{ display: 'grid', gridAutoFlow: 'column', gap: 10, justifyContent: 'start' }}>
        {['de', 'en'].map((x) => (
          <span key={x} onClick={() => setLocale(x)}>
            {locale === x ? <b>{x}</b> : x}
          </span>
        ))}
      </div>
      <div>{t('flatKey')}</div>
      <div>{t('anotherKey')}</div>
      <div>{t('nestedKey.nestedKey')}</div>
      <div>{t('nestedKey.anotherNestedKey')}</div>
    </div>
  );
}
