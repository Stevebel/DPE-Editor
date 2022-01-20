import { BaseStat } from './file-handlers/files/base-stats';
import { ToneData } from './file-handlers/files/cry-table';
import { Evolution } from './file-handlers/files/evolution-table';
import { ItemAnimation } from './file-handlers/files/item-animation-table';
import { LevelUpMove } from './file-handlers/files/learnsets';
import { PicCoords } from './file-handlers/files/pic-coords-table';
import { SpeciesData } from './file-handlers/files/species';
import { PokemonSourceData } from './pokemon-source-data.interface';

export type AllPokemonData = {
  pokemon: PokemonData[];
  species: SpeciesData[];
  lastNationalDex: number;

  source?: PokemonSourceData;
};

export type PokemonData = {
  nationalDex: string;
  regionalDexNumber?: number;
  nationalDexNumber: number;

  // Pokédex data
  categoryName: string;
  height: number;
  weight: number;
  description: string | number;
  pokemonScale: number;
  pokemonOffset: number;
  trainerScale: number;
  trainerOffset: number;

  // Species data
  species: PokemonSpeciesData[];
};

export type PokemonSpeciesData = {
  species: string;
  speciesNumber: number;

  name: string;
  nameConst: string;

  dexEntry?: string;
  dexEntryConst?: string;

  frontSprite?: string;
  backShinySprite?: string;
  iconSprite?: string;
  iconPalette?: number;

  frontCoords?: Omit<PicCoords, 'species'>;
  backCoords?: Omit<PicCoords, 'species'>;
  enemyElevation?: number;

  baseStats?: BaseStatData;
  evolutions?: Evolution[];
  learnset?: LevelUpMove[];
  eggMoves?: string[];

  cryData?: Omit<ToneData, 'species' | 'type'>;
  footprint?: number;
  itemAnimation?: Omit<ItemAnimation, 'species'>;
};

export type BaseStatData = Omit<BaseStat, 'species' | 'noFlip'>;
