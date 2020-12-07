import React from 'react';
import ReactDOM from 'react-dom/server';
import de from './de';
import en from './en';
import { createTranslator } from '../src/translator';
import { LocaleContext } from '../src/context';

const { translate, translateFallback } = createTranslator({ sourceDictionary: de, sourceLocale: 'de', dicts: { en: en as any } });
const context = { locale: 'en' };

console.log(
  ReactDOM.renderToString(
    <LocaleContext.Provider value={context}>
      <div>{translate('amountConfig.emptyCrate.title')}</div>
    </LocaleContext.Provider>,
  ),
);
