// Finds the index of the closing bracket of the first opening bracket found
// unless the bracket is commented out or in quotes.
export function closingBracketIndex(
  str: string,
  open: string,
  close: string
): number {
  let openCount = 0;
  let i = 0;
  while (i < str.length) {
    if (str[i] === `"` || str[i] === `'`) {
      // Skip over quoted strings
      i = str.indexOf(str[i], i + 1);
      if (i === -1) {
        throw new Error(`Unterminated string literal`);
      }
      i += 1;
    } else if (str[i] === '/' && str[i + 1] === '/') {
      // Skip single line comment
      i = str.indexOf('\n', i + 1);
      if (i === -1) {
        throw new Error(`Unterminated line comment`);
      }
    } else if (str[i] === '/' && str[i + 1] === '*') {
      // Skip multi-line comment
      i = str.indexOf('*/', i + 1);
      if (i === -1) {
        throw new Error(`Unterminated block comment`);
      }
      i += 2;
    }

    if (str[i] === open) {
      openCount += 1;
    } else if (str[i] === close) {
      openCount -= 1;
      if (openCount === 0) {
        return i;
      }
    }
    i += 1;
  }
  throw new Error(`Unterminated ${open}: ${str}`);
}

// Find index of the first target character that is not inside a string or brackets
export function nextIndexOf(str: string, target: string): number {
  let i = 0;
  while (i < str.length) {
    if (str[i] === target) {
      return i;
    }
    if (str[i] === `"` || str[i] === `'`) {
      // Skip over quoted strings
      i = str.indexOf(str[i], i + 1);
      if (i === -1) {
        throw new Error(`Unterminated string literal`);
      }
      i += 1;
    } else if (str[i] === '/' && str[i + 1] === '/') {
      // Skip single line comment
      i = str.indexOf('\n', i + 1);
      if (i === -1) {
        throw new Error(`Unterminated line comment`);
      }
    } else if (str[i] === '/' && str[i + 1] === '*') {
      // Skip multi-line comment
      i = str.indexOf('*/', i + 1);
      if (i === -1) {
        throw new Error(`Unterminated block comment`);
      }
      i += 2;
    } else if (str[i] === '[') {
      // Skip over square brackets
      i += closingBracketIndex(str.substring(i), '[', ']');
    } else if (str[i] === '{') {
      // Skip over curly brackets
      i += closingBracketIndex(str.substring(i), '{', '}');
    } else if (str[i] === '(') {
      // Skip over parentheses
      i += closingBracketIndex(str.substring(i), '(', ')');
    } else {
      i += 1;
    }
  }
  return -1;
}

export function nextCommaIndex(str: string): number {
  return nextIndexOf(str, ',');
}

export function regExpEscape(str: string) {
  return str
    .replace(/[-[\]{}()*+!<=:?.^$|#,]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
}

export function setProperty<O, T, K extends KeyOfType<O, T>>(
  o: O,
  key: K,
  value: T
) {
  (o as any)[key] = value;
}
