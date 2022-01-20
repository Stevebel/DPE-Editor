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
