import { Dict, FlatDict, TranslationProps } from './types';

export default function translate<D extends Dict>(dicts: FlatDict[] | undefined, { id, values, fallback }: TranslationProps<D>) {
  if (!dicts) return '';

  const dict = dicts.find((dict) => id in dict);
  const template = dict?.[id];
  console.log('t', id, dicts, template);
  if (!template) return '';

  return template;
}
