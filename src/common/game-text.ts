export const CHAR_SIZES = {
  ' ': 6,
  '+': 8,
  '=': 8,
  ';': 5,
  '&': 8,
  '%': 8,
  '(': 5,
  ')': 5,
  '<': 8,
  '>': 8,
  '!': 6,
  '¡': 6,
  '?': 6,
  '¿': 6,
  '.': 5,
  '-': 6,
  '…': 6,
  '“': 6,
  '”': 6,
  '"': 6,
  "'": 3,
  ',': 5,
  '*': 9,
  '/': 6,
  $: 8,
  ':': 5,

  '0': 6,
  '1': 6,
  '2': 6,
  '3': 6,
  '4': 6,
  '5': 6,
  '6': 6,
  '7': 6,
  '8': 6,
  '9': 6,
  A: 6,
  B: 6,
  C: 6,
  D: 6,
  E: 6,
  F: 6,
  G: 6,
  H: 6,
  I: 6,
  J: 6,
  K: 6,
  L: 6,
  M: 6,
  N: 6,
  O: 6,
  P: 6,
  Q: 6,
  R: 6,
  S: 6,
  T: 6,
  U: 6,
  V: 6,
  W: 6,
  X: 6,
  Y: 6,
  Z: 6,

  a: 6,
  b: 6,
  c: 6,
  d: 6,
  e: 6,
  é: 6,
  f: 5,
  g: 6,
  h: 6,
  i: 4,
  j: 6,
  k: 5,
  l: 5,
  m: 6,
  n: 5,
  o: 6,
  p: 6,
  q: 6,
  r: 5,
  s: 5,
  t: 5,
  u: 6,
  v: 6,
  w: 6,
  x: 6,
  y: 6,
  z: 6,

  À: 6,
  Á: 6,
  Â: 6,
  Ç: 6,
  È: 6,
  É: 6,
  Ê: 6,
  Ë: 6,
  Ì: 6,
  Î: 6,
  Ï: 6,
  Ò: 6,
  Ó: 6,
  Ô: 6,
  Œ: 6,
  Ù: 6,
  Ú: 6,
  Û: 6,
  Ñ: 6,
  ß: 6,
  à: 6,
  á: 6,
  ç: 6,
  è: 6,
  ê: 6,
  ë: 6,
  ì: 6,
  î: 6,
  ï: 6,
  ò: 6,
  ó: 6,
  ô: 6,
  œ: 6,
  ù: 6,
  ú: 6,
  û: 6,
  ñ: 6,
  º: 6,
  ª: 6,
  Í: 6,
  Ä: 6,
  Ö: 6,
  Ü: 6,
  ä: 6,
  ö: 6,
  ü: 6,
};
export const ACTUAL_CHAR_SIZES = {
  '+': 7,
  '=': 7,
  ';': 4,
  '&': 7,
  '(': 4,
  ')': 4,
  '<': 7,
  '>': 7,
  '!': 4,
  '¡': 4,
  '¿': 6,
  '.': 4,
  ',': 4,
  '*': 8,
  $: 7,
  ':': 4,

  '1': 5,

  i: 3,
  l: 4,
  ì: 5,
  î: 5,
};

interface LineInfo {
  width: number;
  text: string;
}

function getTextWidth(text: string) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    width += (CHAR_SIZES as any)[char] || CHAR_SIZES[' '];
  }
  return width;
}

function lineWidthDiff(lines: LineInfo[]) {
  const maxLineWidth = Math.max(...lines.map((l) => l.width));
  const minLineWidth = Math.min(...lines.map((l) => l.width));
  return maxLineWidth - minLineWidth;
}

export function wrapToWidth(text: string, width: number) {
  if (!text || text.trim() === '') {
    return null;
  }

  const words = text
    .replaceAll('’', "'")
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .split(/\s+/);
  let lines: LineInfo[] = [];
  let line: LineInfo | null = null;

  words.forEach((word) => {
    const wordWidth = getTextWidth(word);
    if (line == null || line.width + wordWidth + CHAR_SIZES[' '] > width) {
      if (line) lines.push(line);
      line = {
        width: wordWidth,
        text: word,
      };
    } else {
      line.width += wordWidth + CHAR_SIZES[' '];
      line.text += ` ${word}`;
    }
  });
  lines.push(line!);

  // Try to minimize the line width difference by moving words from the longest line to the next line.
  let bestDiff = lineWidthDiff(lines);
  while (true) {
    const newLines = lines.map((copy) => {
      return {
        width: copy.width,
        text: copy.text,
      };
    });

    const longestLineIndex = newLines.findIndex(
      (l) => l.width === Math.max(...newLines.map((l2) => l2.width))
    );
    if (longestLineIndex === newLines.length - 1) {
      break;
    }
    // Move the word from the longest line to the next line.
    const longestLine = newLines[longestLineIndex];
    const longestLineWords = longestLine.text.split(/\s+/);
    const lastWord = longestLineWords.pop();
    longestLine.text = longestLineWords.join(' ');
    longestLine.width = getTextWidth(longestLine.text);
    // Add the word to the next line.
    const nextLine = newLines[longestLineIndex + 1];
    nextLine.text = `${lastWord} ${nextLine.text}`;
    nextLine.width = getTextWidth(nextLine.text);
    // Recompute the line width difference.
    const newDiff = lineWidthDiff(newLines);
    if (newDiff < bestDiff) {
      bestDiff = newDiff;
      lines = newLines;
    } else {
      break;
    }
  }

  return lines.map((l) => l.text).join('\n');
}
