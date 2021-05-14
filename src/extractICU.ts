type Value = string | number | boolean | Date;

type Whitespace = ' ' | '\t' | '\n' | '\r';

/** Remove leading and tailing whitespace */
type Trim<T> = T extends `${Whitespace}${infer Rest}`
  ? Trim<Rest>
  : T extends `${infer Rest}${Whitespace}`
  ? Trim<Rest>
  : T extends string
  ? T
  : never;

/** Returns an array of top level blocks */
type FindBlocks<Text> = Text extends `${string}{${infer Right}` //find first {
  ? ReadBlock<'', Right, ''> extends [infer Block, infer Tail]
    ? [Block, ...FindBlocks<Tail>] // read block and find next block for tail
    : never
  : []; // no {, return empty result

/** Find blocks for each tuple entry */
type TupleFindBlocks<T> = T extends [infer First, ...infer Rest] ? [...FindBlocks<First>, ...TupleFindBlocks<Rest>] : [];

/** Read tail until the currently open block is closed. Return the block content and rest of tail */
type ReadBlock<Block extends string, Tail extends string, Depth extends string> = Tail extends `${infer L1}}${infer R1}` // find first }
  ? L1 extends `${infer L2}{${infer R2}` // if preceeded by {, this opens a nested block
    ? ReadBlock<`${Block}${L2}{`, `${R2}}${R1}`, `${Depth}+`> // then continue search right of this {
    : Depth extends `+${infer Rest}` // else if depth > 0
    ? ReadBlock<`${Block}${L1}}`, R1, Rest> // then finished nested block, continue search right of first }
    : [`${Block}${L1}`, R1] // else return full block and search for next
  : []; // no }, return emptry result

/** Parse block, return variables with types and recursively find nested blocks within */
type ParseBlock<Block> = Block extends `${infer Name},${infer Format},${infer Rest}`
  ? { [K in Trim<Name>]: VariableType<Trim<Format>> } & TupleParseBlock<TupleFindBlocks<FindBlocks<Rest>>>
  : Block extends `${infer Name},${infer Format}`
  ? { [K in Trim<Name>]: VariableType<Trim<Format>> }
  : { [K in Trim<Block>]: Value };

/** Parse block for each tuple entry */
type TupleParseBlock<T> = T extends [infer First, ...infer Rest] ? ParseBlock<First> & TupleParseBlock<Rest> : unknown;

type VariableType<T extends string> = T extends 'number' | 'plural' | 'selectordinal' ? number : T extends 'date' | 'time' ? Date : Value;

/** Calculates an object type with all variables and their types in the given ICU format string */
export type GetICUArgs<T> = T extends string ? TupleParseBlock<FindBlocks<T>> : never;
