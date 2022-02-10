import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler, IntOrConstHandler } from '../handlers/const-handler';
import { FlagHandler as FlagsHandler } from '../handlers/flags-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type BattleMove = {
  move: string;
  effect: string;
  power: number;
  type: string;
  split: string;
  accuracy: number;
  pp: number;
  secondaryEffectChance: number;
  target: string;
  priority: number;
  flags: string[];
  z_move_power: number;
  z_move_effect: string | number;
};

export type BattleMoves = {
  moves: BattleMove[];
};

export const BattleMovesSourceDef: SourceFileDefinition<BattleMoves> = {
  location: [
    {
      folder: 'cfru',
      fileName: 'src/Tables/battle_moves.c',
    },
  ],
  schema: {
    moves: new ArrayHandler<BattleMove>({
      definition: 'const struct BattleMove gBattleMoves[]',
      indexPrefix: 'MOVE_',
      indexProperty: 'move',
      itemHandler: new StructHandler({
        props: [
          getProp('effect', new ConstHandler({ prefix: 'EFFECT_' })),
          getProp('power', IntHandler),
          getProp('type', new ConstHandler({ prefix: 'TYPE_' })),
          getProp('accuracy', IntHandler),
          getProp('pp', IntHandler),
          getProp('secondaryEffectChance', IntHandler),
          getProp('target', new ConstHandler({ prefix: 'TARGET_' })),
          getProp('priority', IntHandler),
          getProp('flags', new FlagsHandler({ itemPrefix: 'FLAG_' })),
          getProp('z_move_power', IntHandler),
          getProp('split', new ConstHandler({ prefix: 'SPLIT_' })),
          getProp('z_move_effect', IntOrConstHandler),
        ],
      }),
    }),
  },
};
