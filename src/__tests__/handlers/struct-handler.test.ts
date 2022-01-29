import { messageHandler } from '../../common/file-handlers/handlers/message-handler';
import { IntHandler } from '../../common/file-handlers/handlers/number-handlers';
import {
  getProp,
  StructHandler,
  StructHandlerConfig,
} from '../../common/file-handlers/handlers/struct-handler';
import { trimMultiline } from '../../common/test-utils';

describe('StructHandler', () => {
  interface TestData {
    categoryName?: string;
    height?: number;
    weight?: number;
  }
  const DEFAULT_CONFIG: StructHandlerConfig<TestData> = {
    props: [
      getProp('categoryName', messageHandler(12)),
      getProp('height', IntHandler),
      getProp('weight', IntHandler),
    ],
  };

  const SAMPLE_SOURCE = `{
      .categoryName = {_U, _n, _k, _n, _o, _w, _n, _END, _SPACE, _SPACE, _SPACE, _SPACE},
      .height = 1,
      .weight = 2,
    }`;

  const SAMPLE_DATA: TestData = {
    categoryName: 'Unknown',
    height: 1,
    weight: 2,
  };

  const SAMPLE_EMPTY_SOURCE = `{0}`;
  const SAMPLE_EMPTY_DATA = {};

  const DEFAULT_CONFIG_WITHOUT_NAMED_PROPS = {
    ...DEFAULT_CONFIG,
    namedProps: false,
  };

  const SAMPLE_SOURCE_WITHOUT_NAMED_PROPS = `
    {
        {_U, _n, _k, _n, _o, _w, _n, _END, _SPACE, _SPACE, _SPACE, _SPACE},
        1,
        2,
    }
  `;

  it('should parse a struct', () => {
    const handler = new StructHandler(DEFAULT_CONFIG);
    const result = handler.parse(SAMPLE_SOURCE);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should format a struct', () => {
    const handler = new StructHandler(DEFAULT_CONFIG);
    const result = handler.format(SAMPLE_DATA);
    console.log(result);
    expect(trimMultiline(result)).toEqual(trimMultiline(SAMPLE_SOURCE));
  });

  it('should parse an empty struct', () => {
    const handler = new StructHandler(DEFAULT_CONFIG);
    const result = handler.parse(SAMPLE_EMPTY_SOURCE);
    expect(result.value).toEqual(SAMPLE_EMPTY_DATA);
  });

  it('should format an empty struct', () => {
    const handler = new StructHandler(DEFAULT_CONFIG);
    const result = handler.format(SAMPLE_EMPTY_DATA);
    expect(trimMultiline(result)).toEqual(trimMultiline(SAMPLE_EMPTY_SOURCE));
  });

  it('should parse a struct without named props', () => {
    const handler = new StructHandler(DEFAULT_CONFIG_WITHOUT_NAMED_PROPS);
    const result = handler.parse(SAMPLE_SOURCE_WITHOUT_NAMED_PROPS);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should format a struct without named props', () => {
    const handler = new StructHandler(DEFAULT_CONFIG_WITHOUT_NAMED_PROPS);
    const result = handler.format(SAMPLE_DATA);
    expect(trimMultiline(result)).toEqual(
      trimMultiline(SAMPLE_SOURCE_WITHOUT_NAMED_PROPS)
    );
  });

  it('should throw an error if the struct has an improperly formatted property', () => {
    const handler = new StructHandler(DEFAULT_CONFIG);
    expect(() =>
      handler.parse(`
        {
          .height = 0x1,
          .weight: 0x2,
        },
    `)
    ).toThrow();
  });

  it('should throw an error if the struct has an unknown property', () => {
    const handler = new StructHandler(DEFAULT_CONFIG);
    expect(() =>
      handler.parse(`{
          .height = 0x1,
          .weight = 0x2,
          .unknown = 0x3,
        },
      }`)
    ).toThrow();
  });
});
