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

  let result = '';
  if (debug.key) {
    result += `${id} `;
  }

  if (debug.variables && typeof values === 'object' && values !== null && Object.keys(values).length > 0) {
    const stringifiedValues = JSON.stringify({ ...values });
    if (stringifiedValues !== '{}') {
      result += `${stringifiedValues} `;
    }
  }

  if (debug.providedArgs && typeof providedArgs === 'object' && Object.keys(values).length > 0) {
    const stringifiedArgs = JSON.stringify({ ...providedArgs });
    if (stringifiedArgs !== '{}') {
      result += `${stringifiedArgs} `;
    }
  }

  if (debug.translation) {
    result += `="${translation}" `;
  }

  return result.slice(0, -1);
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
