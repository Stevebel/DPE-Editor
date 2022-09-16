import { GenderRatioHandler } from '../../common/file-handlers/handlers/gender-ratio-handler';

describe('GenderRatioHandler', () => {
  it('should parse percent', () => {
    const result = GenderRatioHandler.parse('PERCENT_FEMALE(12.5)');
    expect(result.value).toBeCloseTo(12.5);
  });

  it('should format percent', () => {
    const formatted = GenderRatioHandler.format(100 / 3);
    expect(formatted).toBe('PERCENT_FEMALE(33.3)');
  });

  it('should parse genderless', () => {
    const result = GenderRatioHandler.parse('MON_GENDERLESS');
    expect(result.value).toBe(-1);
  });

  it('should format genderless', () => {
    const formatted = GenderRatioHandler.format(-1);
    expect(formatted).toBe('MON_GENDERLESS');
  });

  it('should parse female', () => {
    const result = GenderRatioHandler.parse('MON_FEMALE');
    expect(result.value).toBe(100);
  });

  it('should format female', () => {
    const formatted = GenderRatioHandler.format(100);
    expect(formatted).toBe('MON_FEMALE');
  });

  it('should parse male', () => {
    const result = GenderRatioHandler.parse('MON_MALE');
    expect(result.value).toBe(0);
  });

  it('should format male', () => {
    const formatted = GenderRatioHandler.format(0);
    expect(formatted).toBe('MON_MALE');
  });

  it('should throw an error if no ratio found', () => {
    expect(() => GenderRatioHandler.parse('FAKE')).toThrow();
  });
});
