import { SourceFileHandler } from '../main/source-file-handler';
import { SourceFileDefinition } from './file-handlers/file-handler.interface';
import { BaseStatsSourceDef } from './file-handlers/files/base-stats';
import { CryTableSourceDef } from './file-handlers/files/cry-table';
import { EggMovesSourceDef } from './file-handlers/files/egg-moves';
import { EnemyElevationTableSourceDef } from './file-handlers/files/enemy-elevation-table';
import { EvolutionTableSourceDef } from './file-handlers/files/evolution-table';
import { FootprintTableSourceDef } from './file-handlers/files/footprint-table';
import { FrontPicAnimsSourceDef } from './file-handlers/files/front-pic-anims';
import { GraphicsSourceDef } from './file-handlers/files/graphics';
import { GraphicsDataSourceDef } from './file-handlers/files/graphics-data';
import { IconTableSourceDef } from './file-handlers/files/icon-table';
import { LevelUpLearnsetPointersSourceDef } from './file-handlers/files/level-up-learnset-pointers';
import { LevelUpLearnsetsSourceDef } from './file-handlers/files/level-up-learnsets';
import {
  PaletteTableSourceDef,
  ShinyPaletteTableSourceDef,
} from './file-handlers/files/palette-table';
import {
  BackPicCoordsTableSourceDef,
  FrontPicCoordsTableSourceDef,
} from './file-handlers/files/pic-coords-table';
import {
  BackPicTableSourceDef,
  FrontPicTableSourceDef,
} from './file-handlers/files/pic-table';
import { PokedexConstsSourceDef } from './file-handlers/files/pokedex';
import { PokedexEntriesSourceDef } from './file-handlers/files/pokedex-entries';
import { PokedexOrderSourceDef } from './file-handlers/files/pokedex-order';
import { PokedexTextSourceDef } from './file-handlers/files/pokedex-text';
import { PokemonConstsSourceDef } from './file-handlers/files/pokemon';
import { PokemonAnimationSourceDef } from './file-handlers/files/pokemon-animation';
import { PokemonNameTableSourceDef } from './file-handlers/files/pokemon-name-table';
import { SpeciesSourceDef } from './file-handlers/files/species';
import { TeachableLearnsetPointersSourceDef } from './file-handlers/files/teachable-learnset-pointers';
import { TeachableLearnsetsSourceDef } from './file-handlers/files/teachable-learnsets';

export const SOURCE_DEFS = {
  baseStats: BaseStatsSourceDef,
  cryTable: CryTableSourceDef,
  eggMoves: EggMovesSourceDef,
  enemyElevationTable: EnemyElevationTableSourceDef,
  evolutionTable: EvolutionTableSourceDef,
  footprintTable: FootprintTableSourceDef,
  frontPicAnims: FrontPicAnimsSourceDef,
  graphicsData: GraphicsDataSourceDef,
  graphics: GraphicsSourceDef,
  iconTable: IconTableSourceDef,
  levelUpLearnsets: LevelUpLearnsetsSourceDef,
  levelUpLearnsetPointers: LevelUpLearnsetPointersSourceDef,
  paletteTable: PaletteTableSourceDef,
  shinyPaletteTable: ShinyPaletteTableSourceDef,
  backPicCoords: BackPicCoordsTableSourceDef,
  frontPicCoords: FrontPicCoordsTableSourceDef,
  backPicTable: BackPicTableSourceDef,
  frontPicTable: FrontPicTableSourceDef,
  pokedexEntries: PokedexEntriesSourceDef,
  pokedexOrders: PokedexOrderSourceDef,
  pokedexText: PokedexTextSourceDef,
  pokedexConsts: PokedexConstsSourceDef,
  pokemonAnimation: PokemonAnimationSourceDef,
  pokemonNameTable: PokemonNameTableSourceDef,
  pokemonConsts: PokemonConstsSourceDef,
  species: SpeciesSourceDef,
  teachableLearnsets: TeachableLearnsetsSourceDef,
  teachableLearnsetPointers: TeachableLearnsetPointersSourceDef,
} as const;

export type SourceDefStruct = typeof SOURCE_DEFS;

export type SourceDefReturnType<K extends keyof SourceDefStruct> =
  SourceDefStruct[K] extends SourceFileDefinition<infer T> ? T : never;

export type PokemonSourceHandlers = {
  -readonly [K in keyof SourceDefStruct]: SourceFileHandler<
    SourceDefReturnType<K>
  >;
};

export type PokemonSourceData = {
  -readonly [K in keyof SourceDefStruct]: SourceDefReturnType<K>;
};
