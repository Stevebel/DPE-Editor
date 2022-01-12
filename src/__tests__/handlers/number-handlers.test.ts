import {
  HexAddressHandler,
  IntHandler,
} from '../../common/file-handlers/handlers/number-handlers';

describe('IntHandler', () => {
  it('should parse a decimal number', () => {
    const result = IntHandler.parse('123');
    expect(result.value).toBe(123);
  });
  it('should parse a hex number', () => {
    const result = IntHandler.parse('0xf3');
    expect(result.value).toBe(0xf3);
  });
  it('should parse a number with spaces', () => {
    const result = IntHandler.parse('  123  ');
    expect(result.value).toBe(123);
  });
  it('should throw an error if no number is found', () => {
    expect(() => IntHandler.parse('')).toThrow();
  });
  it('should throw an error if the number cannot be parsed', () => {
    expect(() => IntHandler.parse('abc')).toThrow();
  });

  it('should format a number', () => {
    expect(IntHandler.format(123)).toBe('123');
  });
});

describe('HexAddressHandler', () => {
  it('should parse a hex address', () => {
    const result = HexAddressHandler.parse('(const u8*) 0x123a4b');
    expect(result.value).toBe(0x123a4b);
  });
  it('should throw an error if no hex address is found', () => {
    expect(() => HexAddressHandler.parse('')).toThrow();
  });
  it('should format a hex address', () => {
    expect(HexAddressHandler.format(0x123a4b)).toBe('(const u8*) 0x123a4b');
  });
});
