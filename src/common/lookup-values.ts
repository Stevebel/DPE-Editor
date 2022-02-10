import { z } from 'zod';
import { SourceFileHandler } from '../main/source-file-handler';
import { SourceFileDefinition } from './file-handlers/file-handler.interface';
import { AttackNameTableSourceDef } from './file-handlers/files/attack_name_table';
import { BattleMovesSourceDef } from './file-handlers/files/battle-moves';
import { SubType } from './ts-utils';
import { zConst } from './zod-common';

export const LOOKUP_DEFS = {
  battleMoves: BattleMovesSourceDef,
  attackNameTable: AttackNameTableSourceDef,
} as const;

export type LookupDefStruct = typeof LOOKUP_DEFS;

export type LookupDefReturnType<K extends keyof LookupDefStruct> =
  LookupDefStruct[K] extends SourceFileDefinition<infer T> ? T : never;

export type LookupHandlers = {
  -readonly [K in keyof LookupDefStruct]: SourceFileHandler<
    LookupDefReturnType<K>
  >;
};

export type LookupData = {
  -readonly [K in keyof LookupDefStruct]: LookupDefReturnType<K>;
};

export const TypeLks = [
  { type: 'NONE', name: '', order: -1 },
  { type: 'NORMAL', name: 'Normal', order: 0 },
  { type: 'FIGHTING', name: 'Fighting', order: 1 },
  { type: 'FLYING', name: 'Flying', order: 2 },
  { type: 'POISON', name: 'Poison', order: 3 },
  { type: 'GROUND', name: 'Ground', order: 4 },
  { type: 'ROCK', name: 'Rock', order: 5 },
  { type: 'BUG', name: 'Bug', order: 6 },
  { type: 'GHOST', name: 'Ghost', order: 7 },
  { type: 'STEEL', name: 'Steel', order: 8 },
  // { type: 'MYSTERY', name: 'Mystery', order: 9},
  { type: 'FIRE', name: 'Fire', order: 10 },
  { type: 'WATER', name: 'Water', order: 11 },
  { type: 'GRASS', name: 'Grass', order: 12 },
  { type: 'ELECTRIC', name: 'Electric', order: 13 },
  { type: 'PSYCHIC', name: 'Psychic', order: 14 },
  { type: 'ICE', name: 'Ice', order: 15 },
  { type: 'DRAGON', name: 'Dragon', order: 16 },
  { type: 'DARK', name: 'Dark', order: 17 },
  // { type: 'ROOSTLESS', name: 'Roostless', order: 19},
  // { type: 'BLANK', name: 'Blank', order: 20},
  { type: 'FAIRY', name: 'Fairy', order: 23 },
] as const;

export type TypeLk = typeof TypeLks[number];

export type TypeConsts = SubType<typeof TypeLks, 'type'>;

export const typeConsts: TypeConsts = TypeLks.map((lk) => lk.type) as any;

export const TypeOrder = TypeLks.reduce((order, t) => {
  order[t.type] = t.order;
  return order;
}, {} as { [key: string]: number });

export const MAX_TYPE_ORDER = TypeLks[TypeLks.length - 1].order;

export const evolutionMethods = [
  'EVO_NONE',
  'EVO_FRIENDSHIP',
  'EVO_FRIENDSHIP_DAY',
  'EVO_FRIENDSHIP_NIGHT',
  'EVO_LEVEL',
  'EVO_TRADE',
  'EVO_TRADE_ITEM',
  'EVO_ITEM',
  'EVO_LEVEL_ATK_GT_DEF',
  'EVO_LEVEL_ATK_EQ_DEF',
  'EVO_LEVEL_ATK_LT_DEF',
  'EVO_LEVEL_SILCOON',
  'EVO_LEVEL_CASCOON',
  'EVO_LEVEL_NINJASK',
  'EVO_LEVEL_SHEDINJA',
  'EVO_BEAUTY',

  'EVO_RAINY_FOGGY_OW',
  'EVO_MOVE_TYPE',
  'EVO_TYPE_IN_PARTY',
  'EVO_MAP',
  'EVO_MALE_LEVEL',
  'EVO_FEMALE_LEVEL',
  'EVO_LEVEL_NIGHT',
  'EVO_LEVEL_DAY',
  'EVO_HOLD_ITEM_NIGHT',
  'EVO_HOLD_ITEM_DAY',
  'EVO_MOVE',
  'EVO_OTHER_PARTY_MON',
  'EVO_LEVEL_SPECIFIC_TIME_RANGE',
  'EVO_FLAG_SET',
  'EVO_CRITICAL_HIT',
  'EVO_NATURE_HIGH',
  'EVO_NATURE_LOW',
  'EVO_DAMAGE_LOCATION',
  'EVO_ITEM_LOCATION',
] as const;
export type EvolutionMethod = typeof evolutionMethods[number];

function evoMethods<M extends [...args: EvolutionMethod[]]>(...args: M): M {
  return args;
}

export const zEvoMethodLevel = z.object({
  method: z.enum(
    evoMethods(
      'EVO_LEVEL',
      'EVO_LEVEL_ATK_EQ_DEF',
      'EVO_LEVEL_ATK_GT_DEF',
      'EVO_LEVEL_ATK_LT_DEF'
    )
  ),
  param: z.number().positive().lte(100),
  extra: z.literal(0).or(zConst),
});

export const zEvoMethodItem = z.object({
  method: z.enum(evoMethods('EVO_ITEM')),
  param: zConst,
  extra: z.literal(0).or(zConst),
});
