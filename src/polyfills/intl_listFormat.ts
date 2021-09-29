export interface ElementPartition {
  type: 'element';
  value: ListPartition[] | string;
}

export interface ListPartitionBase {
  value: string;
}

export interface LiteralPartition extends ListPartitionBase {
  type: 'literal';
}

type ListPartition = ElementPartition | LiteralPartition;

type ListPartitions = ReadonlyArray<ListPartition>;

export interface ListFormatOptions {
  type?: 'conjunction' | 'disjunction' | 'unit';
  style?: 'long' | 'short' | 'narrow';
  localeMatcher?: 'lookup' | 'best fit';
}

export interface ListFormat {
  format(list?: Iterable<string>): string;
  formatToParts(list?: Iterable<string>): ListPartitions;
  resolvedOptions(): ResolvedListFormatOptions;
}

export interface ResolvedListFormatOptions {
  type: 'conjunction' | 'disjunction' | 'unit';
  style: 'long' | 'short' | 'narrow';
  locale: string;
}
