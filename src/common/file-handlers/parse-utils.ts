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
      openCount++;
    } else if (str[i] === close) {
      openCount--;
      if (openCount === 0) {
        return i;
      }
    }
    i++;
  }
  throw new Error(`Unterminated ${open}`);
}

// Find index of the first comma that is not inside a string or brackets
export function nextCommaIndex(str: string): number {
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
    } else if (str[i] === '[') {
      // Skip over square brackets
      i += closingBracketIndex(str.substring(i), '[', ']');
    } else if (str[i] === '{') {
      // Skip over curly brackets
      i += closingBracketIndex(str.substring(i), '{', '}');
    }
    if (str[i] === ',') {
      return i;
    }
    i++;
  }
  return -1;
}

export function regExpEscape(str: string) {
  return str.replace(/[-[\]{}()*+!<=:?.^$|#,]/g, '\\$&');
}
