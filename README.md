# schummar-translate
TypeScript powered translation library for React and Node.js.

[![](https://badgen.net/npm/v/schummar-translate)](https://www.npmjs.com/package/schummar-translate)
[![](https://badgen.net/bundlephobia/minzip/schummar-translate)](https://bundlephobia.com/package/schummar-translate)


# Example
Given a translation file like this:
```ts
// en.ts
export default {
  welcomeMessage: 'Hi, {name}',
  currentTime: 'It is now {t, time, short}',
} as const;
```

schummar-translate is able to provide type checking and autocomplete for both translation keys and parameters in ICU format:
![example](https://user-images.githubusercontent.com/2988557/123524539-45a3cd00-d6cb-11eb-9f02-6884b405dc75.gif)


# Getting started
Install `schummar-translate`.
```bash
npm install schummar-translate
```

## Create and export a translator instance
```ts
import { createTranslator, TranslationContextProvider } from 'schummar-translate/react';
import en from './en.ts';
import de from './de.ts';

export const { t } = createTranslator({
  sourceDictionary: en,
  sourceLocale: 'en',
  dicts: { de }
})
```

## Use it everywhere in your app
```tsx
export App() {
  const [locale, setLocale] = useState('en');
  
  const toggleLocale = () => {
    setLocale((locale) => (locale === 'en' ? 'de' : 'en'));
  }
  
  return (
    <TranslationContextProvider locale={locale}>
      <div onClick={toggleLocale}>
        {t('welcomeMessage', { name: 'schummar' })}
      </div>
    </TranslationContextProvider>
  )
}
```
