import { ArrayHandler } from '../../common/file-handlers/handlers/array-handler';
import {
  ConstDefinitionHandler,
  ConstDefinitionHandlerConfig,
} from '../../common/file-handlers/handlers/const-definitions-handler';
import { ConstHandler } from '../../common/file-handlers/handlers/const-handler';
import { FunctionHandler } from '../../common/file-handlers/handlers/function-handler';
import { IntHandler } from '../../common/file-handlers/handlers/number-handlers';
import { getProp } from '../../common/file-handlers/handlers/struct-handler';
import { trimMultiline } from '../../common/test-utils';

describe('ConstDefinitionsHandler', () => {
  type LevelUpMove = {
    level: number;
    move: string;
  };
  type LevelUpMoves = {
    species: string;
    levelUpMoves: LevelUpMove[];
  };

  const DEFAULT_CONFIG: ConstDefinitionHandlerConfig<LevelUpMoves> = {
    definitionPrefix: 'static const struct LevelUpMove s',
    indexProperty: 'species',
    definitionSuffix: 'LevelUpLearnset[]',
    propHandler: getProp(
      'levelUpMoves',
      new ArrayHandler<LevelUpMove>({
        terminator: 'LEVEL_UP_END',
        itemHandler: new FunctionHandler({
          functionName: 'LEVEL_UP_MOVE',
          parameterProps: [
            getProp('level', IntHandler),
            getProp('move', new ConstHandler({ prefix: 'MOVE_' })),
          ],
        }),
      })
    ),
  };

  const SAMPLE_SOURCE = `
  static const struct LevelUpMove sBulbasaurLevelUpLearnset[] =
  {
    LEVEL_UP_MOVE(1, MOVE_TACKLE),
    LEVEL_UP_MOVE(3, MOVE_GROWL),
    LEVEL_UP_MOVE(7, MOVE_LEECHSEED),
    LEVEL_UP_END
  };

  static const struct LevelUpMove sIvysaurLevelUpLearnset[] =
  {
    LEVEL_UP_MOVE(1, MOVE_TACKLE),
    LEVEL_UP_MOVE(1, MOVE_GROWL),
    LEVEL_UP_MOVE(1, MOVE_LEECHSEED),
    LEVEL_UP_MOVE(3, MOVE_GROWL),
    LEVEL_UP_END
  };
  `;

  const SAMPLE_DATA = [
    {
      species: 'Bulbasaur',
      levelUpMoves: [
        { level: 1, move: 'TACKLE' },
        { level: 3, move: 'GROWL' },
        { level: 7, move: 'LEECHSEED' },
      ],
    },
    {
      species: 'Ivysaur',
      levelUpMoves: [
        { level: 1, move: 'TACKLE' },
        { level: 1, move: 'GROWL' },
        { level: 1, move: 'LEECHSEED' },
        { level: 3, move: 'GROWL' },
      ],
    },
  ];

  it('should parse constant definitions', () => {
    const handler = new ConstDefinitionHandler<LevelUpMoves>(DEFAULT_CONFIG);
    const data = handler.parse(SAMPLE_SOURCE);
    expect(data.value).toEqual(SAMPLE_DATA);
  });

  it('should format constant definitions', () => {
    const handler = new ConstDefinitionHandler<LevelUpMoves>(DEFAULT_CONFIG);
    const data = handler.format(SAMPLE_DATA);
    expect(trimMultiline(data)).toEqual(trimMultiline(SAMPLE_SOURCE));
  });
});
