export type KeyOfType<T, U> = {
  [k in keyof T]: T[k] extends U ? k : never;
}[keyof T];

export function getKeys<O>(o: O) {
  return Object.keys(o) as Extract<keyof O, string>[];
}

export function setProperty<O, T, K extends KeyOfType<O, T>>(
  o: O,
  key: K,
  value: T
) {
  (o as any)[key] = value;
}

export function notUndefined<T>(x: T | undefined): x is T {
  return x != null;
}

export type SubType<
  Tuple extends readonly [...any[]],
  K extends keyof Tuple[number]
> = {
  [Index in keyof Tuple]: Tuple[Index][K];
} & { length: Tuple['length'] };

export type NestedPath<T> = [keyof T, ...Array<string | number>];

export type Head<T extends any[]> = T extends [] ? never : T[0];

export type Tail<T extends any[]> = T extends [head: any, ...tail: infer Tail_]
  ? Tail_
  : never;
