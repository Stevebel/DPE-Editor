import {
  AddressOrConstHandler,
  ConstHandler,
} from '../../common/file-handlers/handlers/const-handler';

describe('ConstHandler', () => {
  it('should parse a const', () => {
    expect(ConstHandler.parse(' DEX_ENTRY_BRAVIARY').value).toBe(
      'DEX_ENTRY_BRAVIARY'
    );
  });
  it('should format a const', () => {
    expect(ConstHandler.format('DEX_ENTRY_BRAVIARY')).toBe(
      'DEX_ENTRY_BRAVIARY'
    );
  });
  it('should throw an error if the const cannot be parsed', () => {
    expect(() => ConstHandler.parse('123')).toThrow();
  });
});

describe('AddressOrConstHandler', () => {
  it('should parse a hex address', () => {
    const result = AddressOrConstHandler.parse('(const u8*) 0x123a4b');
    expect(result.value).toBe(0x123a4b);
  });
  it('should parse a const', () => {
    const result = AddressOrConstHandler.parse(' DEX_ENTRY_BRAVIARY');
    expect(result.value).toBe('DEX_ENTRY_BRAVIARY');
  });
  it('should format a hex address', () => {
    expect(AddressOrConstHandler.format(0x123a4b)).toBe('(const u8*) 0x123a4b');
  });
  it('should format a const', () => {
    expect(AddressOrConstHandler.format('DEX_ENTRY_BRAVIARY')).toBe(
      'DEX_ENTRY_BRAVIARY'
    );
  });
  it('should throw an error if neither a hex address nor a const is found', () => {
    expect(() => AddressOrConstHandler.parse('123')).toThrow();
  });
});
