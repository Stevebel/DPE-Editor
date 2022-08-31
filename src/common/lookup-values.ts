import { flatMap } from 'lodash';
import { z } from 'zod';
import { SourceFileHandler } from '../main/source-file-handler';
import { SourceFileDefinition } from './file-handlers/file-handler.interface';
import { AttackNameTableSourceDef } from './file-handlers/files/attack_name_table';
import { BattleMovesSourceDef } from './file-handlers/files/battle-moves';
import { TMTableSourceDef } from './file-handlers/files/tm_table';
import { SubType } from './ts-utils';
import { zConst } from './zod-common';

export const LOOKUP_DEFS = {
  battleMoves: BattleMovesSourceDef,
  attackNameTable: AttackNameTableSourceDef,
  tmTable: TMTableSourceDef,
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

export const HabitatLks = [
  { habitat: 'Grassland', name: 'Grassland', order: 1 },
  { habitat: 'Forest', name: 'Forest', order: 2 },
  { habitat: 'WatersEdge', name: 'Waters Edge', order: 3 },
  { habitat: 'Sea', name: 'Sea', order: 4 },
  { habitat: 'Cave', name: 'Cave', order: 5 },
  { habitat: 'Mountain', name: 'Mountain', order: 6 },
  { habitat: 'RoughTerrain', name: 'Rough Terrain', order: 7 },
  { habitat: 'Urban', name: 'Urban', order: 8 },
  { habitat: 'Rare', name: 'Rare', order: 9 },
] as const;

export type HabitatLk = typeof HabitatLks[number]['habitat'];

export type HabitatConsts = SubType<typeof HabitatLks, 'habitat'>;

export const habitatConsts: HabitatConsts = HabitatLks.map(
  (lk) => lk.habitat
) as any;

const EvoByLevel = z.object({
  method: z.enum([
    'LEVEL',
    'LEVEL_ATK_EQ_DEF',
    'LEVEL_ATK_GT_DEF',
    'LEVEL_ATK_LT_DEF',
    'LEVEL_SILCOON',
    'LEVEL_CASCOON',
    'LEVEL_NINJASK',
    'LEVEL_SHEDINJA',
    'RAINY_FOGGY_OW',
    'MALE_LEVEL',
    'FEMALE_LEVEL',
    'LEVEL_NIGHT',
    'LEVEL_DAY',
    'LEVEL_SPATK_GT_SPDEF',
  ]),
  targetSpecies: zConst,
  param: z.number().positive().lte(100),
  extra: z.literal(0),
});

const EvoByItem = z.object({
  method: z.enum(['ITEM', 'TRADE_ITEM', 'HOLD_ITEM_NIGHT', 'HOLD_ITEM_DAY']),
  targetSpecies: zConst,
  param: zConst,
  extra: z.literal(0).or(z.enum(['MON_MALE', 'MON_FEMALE'])),
});

export const EvoByType = z.object({
  method: z.enum(['MOVE_TYPE', 'TYPE_IN_PARTY']),
  targetSpecies: zConst,
  param: zConst,
  extra: z.number().nonnegative().lte(100),
});

const EvoByMap = z.object({
  method: z.enum(['MAP']),
  targetSpecies: zConst,
  param: zConst,
  extra: z.literal(0),
});

const EvoByMove = z.object({
  method: z.enum(['MOVE']),
  targetSpecies: zConst,
  param: zConst,
  extra: z.literal(0),
});

export const EvoByOtherSpecies = z.object({
  method: z.enum(['OTHER_PARTY_MON']),
  targetSpecies: zConst,
  param: zConst,
  extra: z.literal(0),
});

const EvoByLevelAndTime = z.object({
  method: z.enum(['LEVEL_SPECIFIC_TIME_RANGE']),
  targetSpecies: zConst,
  param: z.number().positive().lte(100),
  extra: z.number().nonnegative().lte(255),
});

const EvoByFlag = z.object({
  method: z.enum(['FLAG_SET']),
  targetSpecies: zConst,
  param: zConst,
  extra: zConst,
});

const EvoMega = z.object({
  method: z.enum(['MEGA']),
  targetSpecies: zConst,
  param: zConst,
  extra: z.enum([
    'MEGA_VARIANT_STANDARD',
    'MEGA_VARIANT_PRIMAL',
    'MEGA_VARIANT_WISH',
    'MEGA_VARIANT_ULTRA_BURST',
  ]),
});

const EvoNoParams = z.object({
  method: z.enum(['TRADE', 'FRIENDSHIP', 'FRIENDSHIP_DAY', 'FRIENDSHIP_NIGHT']),
  targetSpecies: zConst,
  param: z.literal(0),
  extra: z.literal(0),
});

export const EvoMethodGroups = {
  level: EvoByLevel.shape.method.options,
  item: EvoByItem.shape.method.options,
  type: EvoByType.shape.method.options,
  map: EvoByMap.shape.method.options,
  move: EvoByMove.shape.method.options,
  flag: EvoByFlag.shape.method.options,
  otherSpecies: EvoByOtherSpecies.shape.method.options,
  levelAndTime: EvoByLevelAndTime.shape.method.options,
  mega: EvoMega.shape.method.options,
  noParams: EvoNoParams.shape.method.options,
};

const evoTypes = [
  EvoByLevel,
  EvoByItem,
  EvoNoParams,
  EvoByType,
  EvoByMap,
  EvoByMove,
  EvoByOtherSpecies,
  EvoByLevelAndTime,
  EvoByFlag,
  EvoMega,
] as const;
export const EvolutionSchema = z.union(evoTypes).and(
  z.object({
    id: z.string().optional(),
    targetSpecies: zConst,
  })
);

export const EvolutionMethods = flatMap(
  evoTypes,
  (o) => o.shape.method.options
);

export function getMethodGroup(evoMethod: string) {
  const entry = Object.entries(EvoMethodGroups).find(([_, methods]) => {
    return (methods as string[]).includes(evoMethod);
  });
  if (entry) {
    return entry[0];
  }
  return null;
}
