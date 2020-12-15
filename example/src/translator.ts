import { createTranslator, mergeDicts } from '../..';
import de1 from './translations/de1';
import de2 from './translations/de2';
import en1 from './translations/en1';
import en2 from './translations/en2';

export const { t, translator } = createTranslator({
  sourceLocale: 'en',
  sourceDictionary: mergeDicts(en1, en2),
  dicts: { de: mergeDicts(de1, de2) },
});
