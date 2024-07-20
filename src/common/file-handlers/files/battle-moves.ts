import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import {
  ConstHandler,
  DefaultConstHandler,
  IntOrConstHandler,
} from '../handlers/const-handler';
import { FlagHandler as FlagsHandler } from '../handlers/flags-handler';
import { BooleanHandler, IntHandler } from '../handlers/number-handlers';
import { StructHandler, getProp } from '../handlers/struct-handler';

export type BattleMove = {
  move: string;
  effect: string;
  power: number;
  type: string;
  accuracy: number;
  pp: number;
  secondaryEffectChance: number;
  target: string;
  priority: number;
  flags: string[];
  split: string;
  argument: string | number;
  zMoveEffect: string;

  makesContact: boolean;
  ignoresProtect: boolean;
  magicCoatAffected: boolean;
  snatchAffected: boolean;
  mirrorMoveBanned: boolean;
  ignoresKingsRock: boolean;
  highCritRatio: boolean;
  punchingMove: boolean;
  sheerForceBoost: boolean;
  bitingMove: boolean;
  pulseMove: boolean;
  soundMove: boolean;
  ballisticMove: boolean;
  protectionMove: boolean;
  powderMove: boolean;
  danceMove: boolean;
  windMove: boolean;
  slicingMove: boolean;
  minimizeDoubleDamage: boolean;
  ignoresTargetAbility: boolean;
  ignoresTargetDefenseEvasionStages: boolean;
  damagesUnderground: boolean;
  damagesUnderwater: boolean;
  damagesAirborne: boolean;
  damagesAirborneDoubleDamage: boolean;
  ignoreTypeIfFlyingAndUngrounded: boolean;
  thawsUser: boolean;
  ignoresSubstitute: boolean;
  strikeCount: number;
  meFirstBanned: boolean;
  gravityBanned: boolean;
  mimicBanned: boolean;
  metronomeBanned: boolean;
  copycatBanned: boolean;
  sleepTalkBanned: boolean;
  instructBanned: boolean;
};

export type BattleMoves = {
  moves: BattleMove[];
};

export const BattleMovesSourceDef: SourceFileDefinition<BattleMoves> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/battle_moves.h',
    },
  ],
  schema: {
    moves: new ArrayHandler<BattleMove>({
      definition: 'const struct BattleMove gBattleMoves[MOVES_COUNT_Z]',
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
          getProp('target', new ConstHandler({ prefix: 'MOVE_TARGET_' })),
          getProp('priority', IntHandler),
          getProp('flags', new FlagsHandler({ itemPrefix: 'FLAG_' })),
          getProp('split', new ConstHandler({ prefix: 'SPLIT_' })),
          getProp('argument', IntOrConstHandler),
          getProp('zMoveEffect', DefaultConstHandler),

          getProp('makesContact', BooleanHandler),
          getProp('ignoresProtect', BooleanHandler),
          getProp('magicCoatAffected', BooleanHandler),
          getProp('snatchAffected', BooleanHandler),
          getProp('mirrorMoveBanned', BooleanHandler),
          getProp('ignoresKingsRock', BooleanHandler),
          getProp('highCritRatio', BooleanHandler),
          getProp('punchingMove', BooleanHandler),
          getProp('sheerForceBoost', BooleanHandler),
          getProp('bitingMove', BooleanHandler),
          getProp('pulseMove', BooleanHandler),
          getProp('soundMove', BooleanHandler),
          getProp('ballisticMove', BooleanHandler),
          getProp('protectionMove', BooleanHandler),
          getProp('powderMove', BooleanHandler),
          getProp('danceMove', BooleanHandler),
          getProp('windMove', BooleanHandler),
          getProp('slicingMove', BooleanHandler),
          getProp('minimizeDoubleDamage', BooleanHandler),
          getProp('ignoresTargetAbility', BooleanHandler),
          getProp('ignoresTargetDefenseEvasionStages', BooleanHandler),
          getProp('damagesUnderground', BooleanHandler),
          getProp('damagesUnderwater', BooleanHandler),
          getProp('damagesAirborne', BooleanHandler),
          getProp('damagesAirborneDoubleDamage', BooleanHandler),
          getProp('ignoreTypeIfFlyingAndUngrounded', BooleanHandler),
          getProp('thawsUser', BooleanHandler),
          getProp('ignoresSubstitute', BooleanHandler),
          getProp('strikeCount', IntHandler),
          getProp('meFirstBanned', BooleanHandler),
          getProp('gravityBanned', BooleanHandler),
          getProp('mimicBanned', BooleanHandler),
          getProp('metronomeBanned', BooleanHandler),
          getProp('copycatBanned', BooleanHandler),
          getProp('sleepTalkBanned', BooleanHandler),
          getProp('instructBanned', BooleanHandler),
        ],
      }),
    }),
  },
};
