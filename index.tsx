import React, { createContext, ReactNode, useContext } from "react";

type Dict = { [key: string]: Dict | string };

type FlatDict = { [key: string]: string };

type FlatKeys<T extends Record<string, any>> = keyof {
  [K in keyof T as K extends string
    ? T[K] extends Record<string, any>
      ? `${K}.${FlatKeys<T[K]>}`
      : K
    : never]: 1;
};
type DeepValue<T, K> = K extends `${infer first}.${infer rest}`
  ? first extends keyof T
    ? DeepValue<T[first], rest>
    : never
  : K extends keyof T
  ? T[K]
  : never;

type FlattenDict<D extends Dict> = { [K in FlatKeys<D>]: DeepValue<D, K> };

type Options = {
  mainDict: FlatDict;
  mainDictName: string;
  dicts: { [key: string]: FlatDict };
  path: string;
  fallback?: string;
  values?: any[];
};

const LocalizedContext = createContext<{ lang?: string }>({});

function mapValues<T, S>(
  obj: { [key: string]: T },
  fn: (t: T, key: string) => S
): { [key: string]: S } {
  const result: { [key: string]: S } = {};
  for (const key in obj) result[key] = fn(obj[key], key);
  return result;
}

function T({ path, mainDict, mainDictName, dicts }: Options) {
  const { lang } = useContext(LocalizedContext);
  const dict = !lang || lang === mainDictName ? mainDict : dicts[lang];
  const value = dict[path] ?? mainDict[path];

  return <>{value}</>;
}

function flattenDict(dict: Dict, path = ""): FlatDict {
  const flatDict: FlatDict = {};
  for (const key in dict) {
    const newPath = [path, key].filter(Boolean).join(".");
    const value = dict[key];
    if (typeof value === "string") {
      flatDict[newPath] = value;
    } else {
      Object.assign(flatDict, flattenDict(value, newPath));
    }
  }
  return flatDict;
}

function createValue(options: Options): Value {
  function toNode(...values: any[]) {
    return <T {...options} values={values} />;
  }

  function fallback(fallback = "") {
    return createValue({ ...options, fallback });
  }

  function toString() {
    return options;
  }

  return Object.assign(toNode, { fallback, toString });
}

export function createLocalized<T extends Dict>(
  mainDict: T,
  mainDictName: string,
  dicts: { [key: string]: Partial<T> }
): FlattenDict<T> {
  const flatMainDict = flattenDict(mainDict);
  const flatDicts = mapValues(dicts as { [key: string]: Dict }, flattenDict);

  function resolve(dict: Dict, path = ""): Transformed<any> {
    return mapValues(dict, (value, key) => {
      key = [path, key].filter(Boolean).join(".");
      if (typeof value === "string")
        return createValue({
          mainDict: flatMainDict,
          mainDictName,
          dicts: flatDicts,
          path: key,
        });
      return resolve(value, key);
    });
  }
  return resolve(mainDict);
}
