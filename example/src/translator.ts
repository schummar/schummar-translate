import { createTranslator, mergeDicts } from '../../react';
import de1 from './translations/de1';
import de2 from './translations/de2';
import en1 from './translations/en1';
import en2 from './translations/en2';

export const { useTranslator, t } = createTranslator({
  sourceLocale: 'en',
  sourceDictionary: mergeDicts(en1, en2),
  dicts: { de: mergeDicts(de1, de2) },
});

export const fDate = (date: Date) => t.format('{date, date, ::yyyyMMddHHmm}', { date });
export const fMoney = (amount: number) => t.format('{amount, number, ::currency/EUR}', { amount });
