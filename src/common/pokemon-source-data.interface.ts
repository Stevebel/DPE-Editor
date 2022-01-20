import { SourceFileHandler } from '../main/source-file-handler';
import { SourceFileDefinition } from './file-handlers/file-handler.interface';
import { BaseStatsSourceDef } from './file-handlers/files/base-stats';
import { CryTableSourceDef } from './file-handlers/files/cry-table';
import { CryTable2SourceDef } from './file-handlers/files/cry-table2';
import { EggMovesSourceDef } from './file-handlers/files/egg-moves';
import { EnemyElevationTableSourceDef } from './file-handlers/files/enemy-elevation-table';
import { EvolutionTableSourceDef } from './file-handlers/files/evolution-table';
import { FootprintTableSourceDef } from './file-handlers/files/footprint-table';
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
import { PokedexDataStringSourceDef } from './file-handlers/files/pokedex-data-string';
import { PokedexDataSourceDef } from './file-handlers/files/pokedex-data-table';
import { PokedexOrderSourceDef } from './file-handlers/files/pokedex-order';
import { PokemonNameTableSourceDef } from './file-handlers/files/pokemon-name-table';
import { SpecialInsertsSourceDef } from './file-handlers/files/special-inserts';
import { SpeciesSourceDef } from './file-handlers/files/species';
import { SpeciesToPokedexSourceDef } from './file-handlers/files/species-to-pokedex';
import { SpriteDataSourceDef } from './file-handlers/files/sprite-data';

export const SOURCE_DEFS = {
  pokedexDataTable: PokedexDataSourceDef,
  pokemonNameTable: PokemonNameTableSourceDef,
  pokedexDataString: PokedexDataStringSourceDef,
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
