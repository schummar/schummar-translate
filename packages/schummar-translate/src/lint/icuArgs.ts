import { parse, TYPE, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';

export interface CompareOptions {
  /** Require a select in the translation to have the same option keys as in the source. Default: true */
  selectOptions?: boolean;
}

type Args = Map<string, Set<string>>;

function collect(elements: MessageFormatElement[], args: Args, options: CompareOptions): Args {
  const add = (name: string, kind: string) => {
    const kinds = args.get(name) ?? new Set();
    kinds.add(kind);
    args.set(name, kinds);
  };

  for (const element of elements) {
    switch (element.type) {
      case TYPE.argument:
        add(element.value, 'argument');
        break;
      case TYPE.number:
        add(element.value, 'number');
        break;
      case TYPE.date:
        add(element.value, 'date');
        break;
      case TYPE.time:
        add(element.value, 'time');
        break;
      case TYPE.select:
        add(element.value, options.selectOptions === false ? 'select' : `select (${Object.keys(element.options).sort().join(', ')})`);
        for (const option of Object.values(element.options)) collect(option.value, args, options);
        break;
      case TYPE.plural:
        add(element.value, element.pluralType === 'ordinal' ? 'selectordinal' : 'plural');
        for (const option of Object.values(element.options)) collect(option.value, args, options);
        break;
      case TYPE.tag:
        add(element.value, 'tag');
        collect(element.children, args, options);
        break;
    }
  }
  return args;
}

const describe = (kinds: Set<string>) => [...kinds].sort().join(' and ');

/** Compares the ICU arguments of a translation with those of its source string and describes each difference. */
export function compareMessages(source: string, translation: string, options: CompareOptions = {}): string[] {
  let sourceArgs: Args;
  try {
    sourceArgs = collect(parse(source, { requiresOtherClause: false }), new Map(), options);
  } catch {
    return [];
  }

  let translationArgs: Args;
  try {
    translationArgs = collect(parse(translation, { requiresOtherClause: false }), new Map(), options);
  } catch (error) {
    return [`invalid ICU message: ${String(error)}`];
  }

  const problems: string[] = [];
  for (const [name, kinds] of sourceArgs) {
    const translated = translationArgs.get(name);
    if (!translated) problems.push(`missing argument {${name}}`);
    else if (describe(translated) !== describe(kinds)) {
      problems.push(`{${name}} is ${describe(translated)} but ${describe(kinds)} in the source`);
    }
  }
  for (const name of translationArgs.keys()) {
    if (!sourceArgs.has(name)) problems.push(`unexpected argument {${name}}`);
  }
  return problems;
}
