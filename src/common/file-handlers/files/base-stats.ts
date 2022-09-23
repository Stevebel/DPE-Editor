import { TypeLk } from '../../lookup-values';
import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { FlagHandler } from '../handlers/flags-handler';
import { GenderRatioHandler } from '../handlers/gender-ratio-handler';
import { BooleanHandler, IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type BaseStat = {
  species: string;
  baseHP?: number;
  baseAttack?: number;
  baseDefense?: number;
  baseSpAttack?: number;
  baseSpDefense?: number;
  baseSpeed?: number;
  type1?: TypeLk['type'];
  type2?: TypeLk['type'];
  catchRate?: number;
  expYield?: number;
  evYield_HP?: number;
  evYield_Attack?: number;
  evYield_Defense?: number;
  evYield_SpAttack?: number;
  evYield_SpDefense?: number;
  evYield_Speed?: number;
  itemCommon?: string;
  itemRare?: string;
  genderRatio?: number;
  eggCycles?: number;
  friendship?: number;
  growthRate?: string;
  eggGroup1?: string;
  eggGroup2?: string;
  abilities?: string[];
  safariZoneFleeRate?: number;
  noFlip?: boolean;
  bodyColor?: string;
  flags?: string[];
};

export type BaseStats = {
  baseStats: BaseStat[];
};

export const BaseStatsSourceDef: SourceFileDefinition<BaseStats> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/pokemon/base_stats.h',
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
          getProp('baseSpeed', IntHandler),
          getProp('baseSpAttack', IntHandler),
          getProp('baseSpDefense', IntHandler),
          getProp('type1', new ConstHandler({ prefix: 'TYPE_' })),
          getProp('type2', new ConstHandler({ prefix: 'TYPE_' })),
          getProp('catchRate', IntHandler),
          getProp('expYield', IntHandler),
          getProp('evYield_HP', IntHandler),
          getProp('evYield_Attack', IntHandler),
          getProp('evYield_Defense', IntHandler),
          getProp('evYield_Speed', IntHandler),
          getProp('evYield_SpAttack', IntHandler),
          getProp('evYield_SpDefense', IntHandler),
          getProp('itemCommon', new ConstHandler({ prefix: 'ITEM_' })),
          getProp('itemRare', new ConstHandler({ prefix: 'ITEM_' })),
          getProp('genderRatio', GenderRatioHandler),
          getProp('eggCycles', IntHandler),
          getProp('friendship', IntHandler),
          getProp('growthRate', new ConstHandler({ prefix: 'GROWTH_' })),
          getProp('eggGroup1', new ConstHandler({ prefix: 'EGG_GROUP_' })),
          getProp('eggGroup2', new ConstHandler({ prefix: 'EGG_GROUP_' })),
          getProp(
            'abilities',
            new ArrayHandler<string>({
              itemHandler: new ConstHandler({ prefix: 'ABILITY_' }),
              formatInline: true,
            })
          ),
          getProp('safariZoneFleeRate', IntHandler),
          getProp('bodyColor', new ConstHandler({ prefix: 'BODY_COLOR_' })),
          getProp('noFlip', BooleanHandler),
          getProp(
            'flags',
            new FlagHandler({
              itemPrefix: 'FLAG_',
            })
          ),
        ],
      }),
    }),
  },
};
