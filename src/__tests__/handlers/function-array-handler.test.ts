import { LevelUpMove } from '../../common/file-handlers/files/level-up-learnsets';
import { ConstHandler } from '../../common/file-handlers/handlers/const-handler';
import {
  FunctionArrayHandler,
  FunctionArrayHandlerConfig,
} from '../../common/file-handlers/handlers/function-array-handler';
import { IntHandler } from '../../common/file-handlers/handlers/number-handlers';
import { getProp } from '../../common/file-handlers/handlers/struct-handler';
import { trimMultiline } from '../../common/test-utils';

describe('FunctionArrayHandler', () => {
  const DEFAULT_CONFIG: FunctionArrayHandlerConfig = {
    definition: 'const struct AlternateDexEntries gAlternateDexEntries[]',
    functionConfig: 'ALTERNATE_ENTRY',
    terminator: '{SPECIES_TABLES_TERMIN, 0}',
  };

  const DEFAULT_SOURCE = `
    const struct AlternateDexEntries gAlternateDexEntries[] = {
      ALTERNATE_ENTRY(RATTATA_A),
      ALTERNATE_ENTRY(RATICATE_A),
      {SPECIES_TABLES_TERMIN, 0}
    }
  `;

  const DEFAULT_DATA = ['RATTATA_A', 'RATICATE_A'];

  const CONFIG_WITH_PARAMETERS: FunctionArrayHandlerConfig<LevelUpMove> = {
    functionConfig: {
      functionName: 'LEVEL_UP_MOVE',
      parameterProps: [
        getProp('level', IntHandler),
        getProp('move', new ConstHandler({ prefix: 'MOVE_' })),
      ],
    },
    terminator: 'LEVEL_UP_END',
  };

  const SOURCE_WITH_PARAMETERS = `
    {
        LEVEL_UP_MOVE(1, MOVE_TACKLE),
        LEVEL_UP_MOVE(1, MOVE_STRING_SHOT),
        LEVEL_UP_MOVE(9, MOVE_BUG_BITE),
        LEVEL_UP_END
    }
  `;
  const DATA_WITH_PARAMETERS = [
    {
      level: 1,
      move: 'TACKLE',
    },
    {
      level: 1,
      move: 'STRING_SHOT',
    },
    {
      level: 9,
      move: 'BUG_BITE',
    },
  ];

  it('should parse an array of functions', () => {
    const handler = new FunctionArrayHandler(DEFAULT_CONFIG);
    const data = handler.parse(DEFAULT_SOURCE);
    expect(data.value).toEqual(DEFAULT_DATA);
  });

  it('should format an array of functions', () => {
    const handler = new FunctionArrayHandler(DEFAULT_CONFIG);
    const formatted = handler.format(DEFAULT_DATA);
    expect(trimMultiline(formatted)).toEqual(trimMultiline(DEFAULT_SOURCE));
  });

  it('should parse an array of functions with parameters', () => {
    const handler = new FunctionArrayHandler<LevelUpMove>(
      CONFIG_WITH_PARAMETERS
    );
    const data = handler.parse(SOURCE_WITH_PARAMETERS);
    expect(data.value).toEqual(DATA_WITH_PARAMETERS);
  });

  it('should format an array of functions with parameters', () => {
    const handler = new FunctionArrayHandler<LevelUpMove>(
      CONFIG_WITH_PARAMETERS
    );
    const formatted = handler.format(DATA_WITH_PARAMETERS);
    expect(trimMultiline(formatted)).toEqual(
      trimMultiline(SOURCE_WITH_PARAMETERS)
    );
  });
});
