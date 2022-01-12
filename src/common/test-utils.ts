/* eslint-disable import/prefer-default-export */
export function trimMultiline(str: string) {
  return str
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join('\n');
}
