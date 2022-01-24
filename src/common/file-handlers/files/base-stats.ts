import { TypeLk } from '../../lookup-values';
import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { GenderRatioHandler } from '../handlers/gender-ratio-handler';
import { BooleanHandler, IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type BaseStat = {
  species: string;
  baseHP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpAttack: number;
  baseSpDefense: number;
  baseSpeed: number;
  type1: TypeLk['type'];
  type2: TypeLk['type'];
  catchRate: number;
  expYield: number;
  evYield_HP: number;
  evYield_Attack: number;
  evYield_Defense: number;
  evYield_SpAttack: number;
  evYield_SpDefense: number;
  evYield_Speed: number;
  item1: string;
  item2: string;
  genderRatio: number;
  eggCycles: number;
  friendship: number;
  growthRate: string;
  eggGroup1: string;
  eggGroup2: string;
  ability1: string;
  ability2: string;
  hiddenAbility: string;
  safariZoneFleeRate: number;
  noFlip: boolean;
};

export type BaseStats = {
  baseStats: BaseStat[];
};

export const BaseStatsSourceDef: SourceFileDefinition<BaseStats> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Base_Stats.c',
    },
  ],
  schema: {
    baseStats: new ArrayHandler<BaseStat>({
      definition: 'const struct BaseStats gBaseStats[]',
      indexPrefix: 'SPECIES_',
      indexProperty: 'species',
      itemHandler: new StructHandler({
        props: [
          getProp('baseHP', IntHandler),
          getProp('baseAttack', IntHandler),
          getProp('baseDefense', IntHandler),
          getProp('baseSpAttack', IntHandler),
          getProp('baseSpDefense', IntHandler),
          getProp('baseSpeed', IntHandler),
          getProp('type1', new ConstHandler({ prefix: 'TYPE_' })),
          getProp('type2', new ConstHandler({ prefix: 'TYPE_' })),
          getProp('catchRate', IntHandler),
          getProp('expYield', IntHandler),
          getProp('evYield_HP', IntHandler),
          getProp('evYield_Attack', IntHandler),
          getProp('evYield_Defense', IntHandler),
          getProp('evYield_SpAttack', IntHandler),
          getProp('evYield_SpDefense', IntHandler),
          getProp('evYield_Speed', IntHandler),
          getProp('item1', new ConstHandler({ prefix: 'ITEM_' })),
          getProp('item2', new ConstHandler({ prefix: 'ITEM_' })),
          getProp('genderRatio', GenderRatioHandler),
          getProp('eggCycles', IntHandler),
          getProp('friendship', IntHandler),
          getProp('growthRate', new ConstHandler({ prefix: 'GROWTH_' })),
          getProp('eggGroup1', new ConstHandler({ prefix: 'EGG_GROUP_' })),
          getProp('eggGroup2', new ConstHandler({ prefix: 'EGG_GROUP_' })),
          getProp('ability1', new ConstHandler({ prefix: 'ABILITY_' })),
          getProp('ability2', new ConstHandler({ prefix: 'ABILITY_' })),
          getProp('hiddenAbility', new ConstHandler({ prefix: 'ABILITY_' })),
          getProp('safariZoneFleeRate', IntHandler),
          getProp('noFlip', BooleanHandler),
        ],
      }),
    }),
  },
};
