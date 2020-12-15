import { IntlMessageFormat } from 'intl-messageformat';
import { Dict, FlatDict, TranslationProps } from './types';

export default function translate<D extends Dict>(
  dicts: FlatDict[] | undefined,
  { id, values, fallback, locale }: TranslationProps<D>,
): string | string[] {
  if (!dicts) return '';

  const dict = dicts.find((dict) => id in dict);
  const template = dict?.[id];
  if (!template) {
    if (fallback !== undefined) return [fallback];
    console.warn(`Missing translation: "${id}"`);
    return [id];
  }

  console.log(locale);
  return (template instanceof Array ? template : [template]).map((template) => {
    const s = new IntlMessageFormat(template, locale).format(values) as string;
    return s;
  });
}
