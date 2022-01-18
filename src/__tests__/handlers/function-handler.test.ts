import {
  ConstHandler,
  DefaultConstHandler,
} from '../../common/file-handlers/handlers/const-handler';
import {
  FunctionHandler,
  FunctionHandlerConfig,
  getListProp,
} from '../../common/file-handlers/handlers/function-handler';
import { getProp } from '../../common/file-handlers/handlers/struct-handler';
import { trimMultiline } from '../../common/test-utils';

describe('FunctionHandler', () => {
  type TestData = {
    species: string;
    moves: string[];
  };

  const DEFAULT_CONFIG: FunctionHandlerConfig<TestData> = {
    functionName: 'egg_moves',
    parameterProps: [getProp('species', DefaultConstHandler)],
    restParametersProp: getListProp(
      'moves',
      new ConstHandler({ prefix: 'MOVE_' })
    ),
  };

  const DEFAULT_SOURCE = `
    egg_moves(RATTATA,
      MOVE_SCREECH,
      MOVE_FLAMEWHEEL,
      MOVE_FURYSWIPES,
      MOVE_BITE)
  `;

  const DEFAULT_DATA = {
    species: 'RATTATA',
    moves: ['SCREECH', 'FLAMEWHEEL', 'FURYSWIPES', 'BITE'],
  };

  it('should parse a function', () => {
    const handler = new FunctionHandler(DEFAULT_CONFIG);
    const data = handler.parse(DEFAULT_SOURCE);
    expect(data.value).toEqual(DEFAULT_DATA);
  });

  it('should format a function', () => {
    const handler = new FunctionHandler(DEFAULT_CONFIG);
    const formatted = handler.format(DEFAULT_DATA);
    expect(trimMultiline(formatted)).toEqual(trimMultiline(DEFAULT_SOURCE));
  });

  it('should parse a function with no parameters', () => {
    const handler = new FunctionHandler({
      functionName: 'test',
    });
    const data = handler.parse(`test()`);
    expect(data.value).toEqual({});
  });

  it('should format a function with no parameters', () => {
    const handler = new FunctionHandler({
      functionName: 'test',
    });
    const formatted = handler.format({});
    expect(trimMultiline(formatted)).toEqual(trimMultiline(`test()`));
  });
});
