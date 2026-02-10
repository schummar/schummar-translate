import type { ICUArgument, ICUDateArgument, TranslatorDebugOptions } from './types';

export function applyDebugOutput<F>(
  {
    translation,
    id,
    values,
    providedArgs,
  }: {
    translation: string | F;
    id: string;
    values?: any;
    providedArgs: Record<string, ICUArgument | ICUDateArgument> | undefined;
  },
  options?: boolean | TranslatorDebugOptions,
) {
  const debug = getDebugOptions(options ?? false);

  if (!debug) {
    return translation;
  }

  const parts: string[] = [];
  if (debug.key) {
    parts.push(id);
  }

  if (debug.variables) {
    const stringifiedValues = JSON.stringify({ ...values });
    if (stringifiedValues !== '{}') {
      parts.push(stringifiedValues);
    }
  }

  if (debug.providedArgs) {
    const stringifiedArgs = JSON.stringify({ ...providedArgs });
    if (stringifiedArgs !== '{}') {
      parts.push(stringifiedArgs);
    }
  }

  if (debug.translation) {
    parts.push(`="${translation}"`);
  }

  return parts.join(' ');
}

function getDebugOptions(options: boolean | TranslatorDebugOptions): Required<TranslatorDebugOptions> | false {
  if (typeof options === 'boolean') {
    if (options) {
      return {
        key: true,
        variables: true,
        translation: true,
        providedArgs: true,
      };
    }

    return false;
  }

  return {
    key: options.key ?? false,
    variables: options.variables ?? false,
    translation: options.translation ?? false,
    providedArgs: options.providedArgs ?? false,
  };
}
