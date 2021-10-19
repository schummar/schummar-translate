import { parse } from '@formatjs/icu-messageformat-parser';
import { IntlMessageFormat } from 'intl-messageformat';
import { MaybePromise } from '.';
import { Cache } from './cache';
import { mapPotentialArray } from './mapPotentialArray';
import { FlatDict } from './types';

export function translate<F = never>({
  dicts,
  sourceDict,
  id,
  values,
  fallback,
  placeholder,
  locale,
  warn,
  cache,
}: {
  dicts: MaybePromise<FlatDict>[];
  sourceDict?: MaybePromise<FlatDict> | null;
  id: string;
  values?: any;
  fallback?: F | ((id: string, sourceTranslation?: string | readonly string[]) => F);
  placeholder?: F | ((id: string, sourceTranslation?: string | readonly string[]) => F);
  locale: string;
  warn?: (locale: string, id: string) => void;
  cache: Cache;
}): string | F | (string | F)[] | F {
  if (fallback !== undefined) {
    dicts = dicts.slice(0, 1);
  }

  const dict = dicts.find((dict) => dict instanceof Promise || id in dict);

  if (dict instanceof Promise) {
    return mapPotentialArray(
      sourceDict && !(sourceDict instanceof Promise)
        ? translate<string>({ dicts: [sourceDict], sourceDict, id, values, locale, cache })
        : undefined,
      (sourceTranslation) => {
        if (placeholder instanceof Function) {
          return placeholder(id, sourceTranslation);
        }
        return placeholder ?? '';
      },
    );
  }

  const template = dict?.[id];
  if (!template) {
    if (fallback instanceof Function) {
      const sourceTranslation =
        sourceDict && !(sourceDict instanceof Promise)
          ? translate<string>({ dicts: [sourceDict], sourceDict, id, values, locale, cache })
          : undefined;
      return fallback(id, sourceTranslation);
    }
    if (fallback !== undefined) return fallback;

    warn?.(locale, id);
    return id;
  }

  return mapPotentialArray(template, (template) => format({ template, values, locale, cache }));
}

export function format({
  template,
  values,
  locale,
  cache,
}: {
  template: string;
  values?: Record<string, unknown>;
  locale?: string;
  cache: Cache;
}): string {
  try {
    const ast = parse(template, { requiresOtherClause: false });
    const f = new IntlMessageFormat(ast, locale, undefined, {
      formatters: {
        getDateTimeFormat(...args) {
          return cache.get(Intl.DateTimeFormat, ...args);
        },
        getNumberFormat(...args) {
          return cache.get(Intl.NumberFormat, ...args);
        },
        getPluralRules(...args) {
          return cache.get(Intl.PluralRules, ...args);
        },
      },
    });
    const msg = f.format(values);
    if (msg instanceof Array) return msg.join(' ');
    return String(msg);
  } catch (e) {
    return `Wrong format: ${String(e)}`;
  }
}
