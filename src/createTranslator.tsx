import React from 'react';
import { GetICUArgs } from './extractICU';
import Translation from './translation';
import { Translator } from './translator';
import { DeepValue, Dict, FlatKeys, Options } from './types';

type Values<D extends Dict, K extends string> = GetICUArgs<DeepValue<D, K>>;
type Args<D extends Dict, K extends string> = {} extends Values<D, K>
  ? [] | [{} | undefined] | [{} | undefined, string | undefined]
  : [Values<D, K>] | [Values<D, K>, string | undefined];

export function createTranslator<D extends Dict>(
  options: Options<D>,
): {
  translator: Translator<D>;
  t: <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) => JSX.Element;
} {
  const translator = new Translator(options);

  return {
    translator,
    t: <K extends FlatKeys<D>>(id: K, ...args: Args<D, K>) => (
      <Translation translator={translator} id={id} values={args[0]} fallback={args[1]} />
    ),
  };
}
