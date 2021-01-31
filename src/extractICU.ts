type Str<T> = T extends string ? T : never;

type TupleStr<T> = T extends string[] ? T : never;

type Value = string | number | boolean | Date;

type Trim<T extends string> = T extends ` ${infer Rest}` ? Trim<Rest> : T extends `${infer Rest} ` ? Trim<Rest> : T;

type FindBlock<T extends string> = T extends `${infer Left}{${infer Right}` //find first {
  ? Left extends `${any}}${any}` // If preceeded by },
    ? [] // then invalid string, return empty result
    : ReadBlock<'', Right, ''> // else read block
  : []; // no {, return empty result

type TupleFindBlock<T extends string[]> = T extends [infer First, ...infer Rest]
  ? [...FindBlock<Str<First>>, ...TupleFindBlock<TupleStr<Rest>>]
  : [];

type ReadBlock<Prefix extends string, Block extends string, Depth extends string> = Block extends `${infer L1}}${infer R1}` // find first }
  ? L1 extends `${infer L2}{${infer R2}` // if preceeded by {, this opens a nested block
    ? ReadBlock<`${Prefix}${L2}{`, `${R2}}${R1}`, `${Depth}+`> // then continue search right of this {
    : Depth extends `+${infer Rest}` // else if depth > 0
    ? ReadBlock<`${Prefix}${L1}}`, R1, Rest> // then finished nested block, continue search right of first }
    : [`${Prefix}${L1}`, ...FindBlock<R1>] // else return full block and search for next
  : []; // no }, return emptry result

type ParseArgument<T extends string> = T extends `${infer Name},${infer Format},${infer Rest}`
  ? { [K in Trim<Name>]: ArgumentType<Trim<Format>> } & TupleParseArgument<TupleFindBlock<FindBlock<Rest>>>
  : T extends `${infer Name},${infer Format}`
  ? { [K in Trim<Name>]: ArgumentType<Trim<Format>> }
  : { [K in Trim<T>]: Value };

type TupleParseArgument<T extends string[]> = T extends [infer First, ...infer Rest]
  ? ParseArgument<Str<First>> & TupleParseArgument<TupleStr<Rest>>
  : unknown;

type ArgumentType<T extends string> = T extends 'number' | 'plural' ? number : T extends 'date' ? Date : Value;

export type GetICUArgs<T> = T extends string ? TupleParseArgument<FindBlock<T>> : never;
