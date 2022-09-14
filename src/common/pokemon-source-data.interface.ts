import { SourceFileHandler } from '../main/source-file-handler';
import { SourceFileDefinition } from './file-handlers/file-handler.interface';
import { BaseStatsSourceDef } from './file-handlers/files/base-stats';
import { CryTableSourceDef } from './file-handlers/files/cry-table';
import { CryTable2SourceDef } from './file-handlers/files/cry-table2';
import { EggMovesSourceDef } from './file-handlers/files/egg-moves';
import { EnemyElevationTableSourceDef } from './file-handlers/files/enemy-elevation-table';
import { EvolutionTableSourceDef } from './file-handlers/files/evolution-table';
import { FootprintTableSourceDef } from './file-handlers/files/footprint-table';
import { HabitatTableSourceDef } from './file-handlers/files/habitat-table';
import { IconPaletteTableSourceDef } from './file-handlers/files/icon-palette-table';
import { IconTableSourceDef } from './file-handlers/files/icon-table';
import { ItemAnimationTableSourceDef } from './file-handlers/files/item-animation-table';
import { LearnsetsSourceDef } from './file-handlers/files/learnsets';
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
import { PokemonNameTableSourceDef } from './file-handlers/files/pokemon-name-table';
import { SpecialInsertsSourceDef } from './file-handlers/files/special-inserts';
import { SpeciesSourceDef } from './file-handlers/files/species';
import { SpeciesToPokedexSourceDef } from './file-handlers/files/species-to-pokedex';
import { SpriteDataSourceDef } from './file-handlers/files/sprite-data';

export const SOURCE_DEFS = {
  pokedexEntries: PokedexEntriesSourceDef,
  pokemonNameTable: PokemonNameTableSourceDef,
  pokedexText: PokedexTextSourceDef,
  species: SpeciesSourceDef,
  pokedexConsts: PokedexConstsSourceDef,
  speciesToPokedex: SpeciesToPokedexSourceDef,
  spriteData: SpriteDataSourceDef,
  specialInserts: SpecialInsertsSourceDef,
  backPicCoords: BackPicCoordsTableSourceDef,
  backPicTable: BackPicTableSourceDef,
  baseStats: BaseStatsSourceDef,
  cryTable: CryTableSourceDef,
  cryTable2: CryTable2SourceDef,
  eggMoves: EggMovesSourceDef,
  enemyElevationTable: EnemyElevationTableSourceDef,
  evolutionTable: EvolutionTableSourceDef,
  footprintTable: FootprintTableSourceDef,
  frontPicCoords: FrontPicCoordsTableSourceDef,
  frontPicTable: FrontPicTableSourceDef,
  iconPaletteTable: IconPaletteTableSourceDef,
  itemAnimationTable: ItemAnimationTableSourceDef,
  iconTable: IconTableSourceDef,
  learnsets: LearnsetsSourceDef,
  paletteTable: PaletteTableSourceDef,
  shinyPaletteTable: ShinyPaletteTableSourceDef,
  pokedexOrders: PokedexOrderSourceDef,
  habitatTable: HabitatTableSourceDef,
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
