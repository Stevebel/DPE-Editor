import { closingBracketIndex, nextCommaIndex } from '../common/file-handlers/parse-utils';

describe('closingBracketIndex', () => {
  it('should find the closing bracket index', () => {
    const str = '{[}';
    const index = closingBracketIndex(str, '{', '}');
    expect(index).toBe(2);
  });
  it('should find the closing bracket index with nested brackets', () => {
    const str = '{[{}]}{}';
    const index = closingBracketIndex(str, '{', '}');
    expect(index).toBe(5);
  });
  it('should find the closing bracket index with brackets in quotes', () => {
    const str = '{"}"]}{}';
    const index = closingBracketIndex(str, '{', '}');
    expect(index).toBe(5);
  });
  it('should find the closing bracket index with commented out brackets', () => {
    const str = '{/*[*/}]}{}';
    const index = closingBracketIndex(str, '{', '}');
    expect(index).toBe(6);
  });
  it('should find the closing bracket index with line commented out brackets', () => {
    const str = `{\n//}\n}]}{}`;
    const index = closingBracketIndex(str, '{', '}');
    expect(index).toBe(6);
  });
  it('should throw an error if brackets are unbalanced', () => {
    const str = '{[]';
    expect(() => closingBracketIndex(str, '{', '}')).toThrow();
  });
  it('should throw an error if quotes are unbalanced', () => {
    const str = '{"[]}';
    expect(() => closingBracketIndex(str, '{', '}')).toThrow();
  });
  it('should throw an error if comments are unbalanced', () => {
    const str = '{/*[]}';
    expect(() => closingBracketIndex(str, '{', '}')).toThrow();
  });
  it('should throw an error if line comments are unbalanced', () => {
    const str = `{\n//}`;
    expect(() => closingBracketIndex(str, '{', '}')).toThrow();
  });
});

describe('nextCommaIndex', () => {
  it('should find the next comma index', () => {
    const str = 'a,b,c';
    const index = nextCommaIndex(str);
    expect(index).toBe(1);
  });
  it('should find the next comma index not in brackets', () => {
    const str = '{a,b},c';
    const index = nextCommaIndex(str);
    expect(index).toBe(5);
  });
  it('should find the next comma index not in square brackets', () => {
    const str = '[a,b],c';
    const index = nextCommaIndex(str);
    expect(index).toBe(5);
  });
  it('should find the next comma index not in quotes', () => {
    const str = `"a,b",c`;
    const index = nextCommaIndex(str);
    expect(index).toBe(5);
  });
  it('should find the next comma index not in comments', () => {
    const str = `/*a,b*/,c`;
    const index = nextCommaIndex(str);
    expect(index).toBe(7);
  });
  it('should find the next comma index not in line comments', () => {
    const str = `//a,b\n,c`;
    const index = nextCommaIndex(str);
    expect(index).toBe(6);
  });
  it('should return -1 if no comma is found', () => {
    const str = 'abc';
    const index = nextCommaIndex(str);
    expect(index).toBe(-1);
  });
  it('should throw an error if quotes are unbalanced', () => {
    const str = '"a,b,c';
    expect(() => nextCommaIndex(str)).toThrow();
  });
  it('should throw an error if comments are unbalanced', () => {
    const str = '/*a,b,c';
    expect(() => nextCommaIndex(str)).toThrow();
  });
  it('should throw an error if line comments are unbalanced', () => {
    const str = `//a,b,c`;
    expect(() => nextCommaIndex(str)).toThrow();
  });
  it('should find comma with complex string', () => {
    const str =
      '.categoryName = {_U, _n, _k, _n, _o, _w, _n, _END, _SPACE, _SPACE, _SPACE, _SPACE},';
    const index = nextCommaIndex(str);
    expect(index).toBe(str.length - 1);
  });
});
