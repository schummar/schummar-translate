import { MessageFormatElement, parse, TYPE } from '@formatjs/icu-messageformat-parser';
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
  ignoreMissingArgs,
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
  ignoreMissingArgs?: boolean | string | ((id: string, template: string) => string);
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

  return mapPotentialArray(template, (template) => format({ template, values, locale, cache, ignoreMissingArgs }));
}

export function format({
  template,
  values,
  locale,
  cache,
  ignoreMissingArgs,
}: {
  template: string;
  values?: Record<string, unknown>;
  locale?: string;
  cache: Cache;
  ignoreMissingArgs?: boolean | string | ((id: string, template: string) => string);
}): string {
  try {
    const ast = parse(template, { requiresOtherClause: false });

    const f = new IntlMessageFormat(ast, locale, undefined, {
      formatters: {
        getDateTimeFormat(...args) {
          return cache.get(Intl.DateTimeFormat, ...args);
        },
        getNumberFormat(locals, opts) {
          return cache.get(Intl.NumberFormat, locals, opts as Intl.NumberFormatOptions | undefined);
        },
        getPluralRules(...args) {
          return cache.get(Intl.PluralRules, ...args);
        },
      },
    });

    if (ignoreMissingArgs) {
      values = { ...values };
      for (const arg of new Set(findArgs(ast))) {
        if (!(arg in values)) {
          if (ignoreMissingArgs === true) {
            values[arg] = '';
          } else if (typeof ignoreMissingArgs === 'string') {
            values[arg] = ignoreMissingArgs;
          } else {
            values[arg] = ignoreMissingArgs(arg, template);
          }
        }
      }
    }

    const msg = f.format(values);
    if (msg instanceof Array) return msg.join(' ');
    return String(msg);
  } catch (e) {
    return `Wrong format: ${String(e)}`;
  }
}

function findArgs(ast: MessageFormatElement[]): string[] {
  return ast.flatMap((el) => {
    if (el.type === TYPE.argument || el.type === TYPE.number || el.type === TYPE.date || el.type === TYPE.time) {
      return [el.value];
    }

    if (el.type === TYPE.select || el.type === TYPE.plural) {
      return [el.value, ...findArgs(Object.values(el.options).flatMap((option) => option.value))];
    }

    return [];
  });
}
