import { MessageFormatElement, parse, TYPE } from '@formatjs/icu-messageformat-parser';
import { IntlMessageFormat } from 'intl-messageformat';
import { MaybePromise } from '.';
import { Cache } from './cache';
import { customDateTimeFormat, customDateTimeFormatRange } from './intlHelpers';
import { mapPotentialArray } from './mapPotentialArray';
import { FlatDict, ICUArgument, ICUDateArgument, TranslatorDebugOptions } from './types';
import { isPromise } from './helpers';
import { applyDebugOutput } from './debug';

export function translate<F = never>({
  dicts,
  sourceDict,
  id,
  values,
  fallback,
  fallbackIgnoresFallbackLocales,
  debug,
  placeholder,
  locale,
  warn,
  cache,
  ignoreMissingArgs,
  providedArgs,
}: {
  dicts: MaybePromise<FlatDict>[];
  sourceDict?: MaybePromise<FlatDict> | null;
  id: string;
  values?: any;
  fallback?: F | ((id: string, sourceTranslation?: string | readonly string[]) => F);
  fallbackIgnoresFallbackLocales?: boolean;
  debug?: boolean | TranslatorDebugOptions;
  placeholder?: F | ((id: string, sourceTranslation?: string | readonly string[]) => F);
  locale: string;
  warn?: (locale: string, id: string) => void;
  cache: Cache;
  ignoreMissingArgs: boolean | string | ((id: string, template: string) => string) | undefined;
  providedArgs: Record<string, ICUArgument | ICUDateArgument> | undefined;
}): string | F | (string | F)[] | F {
  if (fallback !== undefined && fallbackIgnoresFallbackLocales) {
    dicts = dicts.slice(0, 1);
  }

  const dict = dicts.find((dict) => isPromise(dict) || id in dict);

  if (isPromise(dict)) {
    return mapPotentialArray(
      sourceDict && !isPromise(sourceDict)
        ? translate<string>({
            dicts: [sourceDict],
            sourceDict,
            id,
            values,
            locale,
            cache,
            ignoreMissingArgs,
            providedArgs,
            debug,
          })
        : undefined,
      (sourceTranslation) => {
        const translation = placeholder instanceof Function ? placeholder(id, sourceTranslation) : (placeholder ?? '');
        return applyDebugOutput(
          {
            translation,
            id,
            values,
            providedArgs,
          },
          debug,
        );
      },
    );
  }

  const template = dict?.[id];
  if (!template) {
    if (fallback instanceof Function) {
      const sourceTranslation =
        sourceDict && !isPromise(sourceDict)
          ? translate<string>({
              dicts: [sourceDict],
              sourceDict,
              id,
              values,
              locale,
              cache,
              ignoreMissingArgs,
              providedArgs,
              debug,
            })
          : undefined;
      const translation = fallback(id, sourceTranslation);
      return applyDebugOutput(
        {
          translation,
          id,
          values,
          providedArgs,
        },
        debug,
      );
    }
    if (fallback !== undefined) return fallback;

    warn?.(locale, id);

    return applyDebugOutput(
      {
        translation: id,
        id,
        values,
        providedArgs,
      },
      debug,
    );
  }

  return mapPotentialArray(template, (template) =>
    applyDebugOutput(
      {
        translation: format({ template, values, locale, cache, ignoreMissingArgs, providedArgs }),
        id,
        values,
        providedArgs,
      },
      debug,
    ),
  );
}

export function format({
  template,
  values,
  locale,
  cache,
  ignoreMissingArgs,
  providedArgs,
}: {
  template: string;
  values?: Record<string, unknown>;
  locale?: string;
  cache: Cache;
  ignoreMissingArgs: boolean | string | ((id: string, template: string) => string) | undefined;
  providedArgs: Record<string, ICUArgument | ICUDateArgument> | undefined;
}): string {
  values = { ...providedArgs, ...values };

  try {
    const ast = parse(template, { requiresOtherClause: false });

    const f = new IntlMessageFormat(ast, locale, undefined, {
      formatters: {
        getDateTimeFormat(locals, options) {
          const instance = cache.get(Intl.DateTimeFormat, locals, options);

          return {
            ...instance,
            format: (date) => customDateTimeFormat(cache, locale, options, date),
            formatRange: (startDate, endDate) =>
              typeof startDate === 'bigint' || typeof endDate === 'bigint'
                ? instance.formatRange(startDate, endDate)
                : customDateTimeFormatRange(cache, locale, options, startDate, endDate),
          };
        },
        getNumberFormat(locals, options) {
          return cache.get(Intl.NumberFormat, locals, options as Intl.NumberFormatOptions | undefined);
        },
        getPluralRules(locals, options) {
          return cache.get(Intl.PluralRules, locals, options);
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
