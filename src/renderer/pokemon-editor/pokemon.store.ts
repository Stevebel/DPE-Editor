/* eslint-disable max-classes-per-file */
import { makeAutoObservable } from 'mobx';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { ZodError } from 'zod';
import { ToneData } from '../../common/file-handlers/files/cry-table';
import { Evolution } from '../../common/file-handlers/files/evolution-table';
import { ItemAnimation } from '../../common/file-handlers/files/item-animation-table';
import { LevelUpMove } from '../../common/file-handlers/files/learnsets';
import { PicCoords } from '../../common/file-handlers/files/pic-coords-table';
import { AppIPC } from '../../common/ipc.interface';
import {
  BaseStatData,
  IPokemonData,
  IPokemonSpeciesData,
  PokemonDataSchema,
  PokemonSpeciesDataSchema,
} from '../../common/pokemon-data.interface';
import { NestedPath } from '../../common/ts-utils';
import {
  CanUpdatePath,
  doUpdatePath,
  getErrorByPath,
} from '../common/forms/CanUpdatePath.interface';

function formatSpeciesConst(species: string): string {
  const endsWithSpace = species.match(/[\s_]$/);
  const clean = species.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
  if (!endsWithSpace) {
    return clean.replace(/_$/, '');
  }
  return clean;
}

export class PokemonSpeciesData implements IPokemonSpeciesData {
  name = '';

  species = '';

  nameConst = '';

  speciesNumber = -1;

  dexEntry?: string;

  dexEntryConst: string | number = -1;

  frontSprite?: string;

  backShinySprite?: string;

  iconSprite?: string;

  iconPalette?: number;

  frontCoords?: Omit<PicCoords, 'species'>;

  backCoords?: Omit<PicCoords, 'species'>;

  enemyElevation = 0;

  baseStats?: BaseStatData;

  evolutions?: Evolution[];

  learnset?: LevelUpMove[];

  eggMoves?: string[];

  cryData?: Omit<ToneData, 'species' | 'type'>;

  footprint?: number;

  itemAnimation?: Omit<ItemAnimation, 'species'>;

  id: string;

  // State
  manualSpecies = false;

  errors: ZodError<typeof PokemonSpeciesDataSchema> | null = null;

  constructor(data?: Partial<IPokemonSpeciesData>, id = uuid()) {
    makeAutoObservable(this);
    if (data) {
      Object.assign(this, data);
      if (this.species !== formatSpeciesConst(this.name)) {
        this.manualSpecies = true;
      }
    }
    this.id = id;
    this.performErrorCheck();
  }

  setPokemonName(name: string) {
    this.name = name;
    if (!this.manualSpecies) {
      this.setSpeciesConst(name);
      this.performErrorCheck();
    }
  }

  setSpeciesConst(species: string) {
    this.species = formatSpeciesConst(species);
    this.nameConst = this.species;
    this.performErrorCheck();
  }

  updatePath<Path extends NestedPath<this>>(newValue: any, path: Path) {
    doUpdatePath(this, newValue, path);
    this.performErrorCheck();
  }

  getErrorForPath(path: NestedPath<this>) {
    return getErrorByPath(this.errors, path);
  }

  performErrorCheck() {
    const errorCheck = PokemonSpeciesDataSchema.safeParse(this);
    if (!errorCheck.success) {
      this.errors = errorCheck.error;
    } else {
      this.errors = null;
    }
  }
}

export class PokemonData implements IPokemonData, CanUpdatePath {
  id: string;

  nationalDex = '';

  regionalDexNumber?: number;

  nationalDexNumber = -1;

  // Pokédex data
  categoryName = 'Unknown';

  height = 0;

  weight = 0;

  description: string | number = '';

  pokemonScale = 0;

  pokemonOffset = 0;

  trainerScale = 0;

  trainerOffset = 0;

  // Species data
  species: PokemonSpeciesData[] = [];

  // State
  errors: ZodError<typeof PokemonDataSchema> | null = null;

  constructor(data?: Partial<IPokemonData>, id = uuid()) {
    makeAutoObservable(this, {
      id: false,
    });

    if (data) {
      Object.assign(this, {
        ...data,
        species:
          data.species?.map((species) => new PokemonSpeciesData(species)) || [],
      });
    }
    this.id = id;
    if (this.species.length === 0) {
      const defaultSpecies = new PokemonSpeciesData();
      this.species.push(defaultSpecies);
    }

    this.performErrorCheck();
  }

  updatePath<Path extends NestedPath<this>>(newValue: any, path: Path) {
    doUpdatePath(this, newValue, path);
    this.performErrorCheck();
  }

  getErrorForPath(path: NestedPath<this>) {
    return getErrorByPath(this.errors, path);
  }

  performErrorCheck() {
    const errorCheck = PokemonDataSchema.safeParse(this);
    if (!errorCheck.success) {
      console.log(`#${this.nationalDexNumber}`, errorCheck, this);
      this.errors = errorCheck.error;
    } else {
      this.errors = null;
    }
  }
}

export class PokemonStore {
  pokemon: PokemonData[] = [];

  selectedPokemonId = '';

  selectedSpeciesId = '';

  constructor(ipc: AppIPC) {
    makeAutoObservable(this);

    ipc.on('pokemon-source-data', (data) => {
      this.pokemon = data.pokemon.map((p) => new PokemonData(p));
      console.log('raw data', data.source);
    });
  }

  addPokemon(data?: Partial<IPokemonData>) {
    let copyFrom = data;
    if (!copyFrom && this.selectedPokemon) {
      copyFrom = {
        ...this.selectedPokemon,
        species: this.selectedPokemon.species.map((species) => ({
          ...species,
          name: `${species.name} Copy`,
          species: `${species.species}_COPY`,
        })),
      };
    }
    const pokemon = new PokemonData({
      ...copyFrom,
      nationalDexNumber: this.pokemon.length,
    });
    console.log('New pokemon', pokemon);
    this.pokemon = [...this.pokemon, pokemon];
    this.setSelectedPokemon(pokemon.id);
  }

  removePokemon(pokemon: PokemonData) {
    const index = this.pokemon.findIndex((p) => p.id === pokemon.id);
    if (index !== -1) {
      this.pokemon = [
        ...this.pokemon.slice(0, index),
        ...this.pokemon.slice(index + 1),
      ];
    }
  }

  get selectedPokemon() {
    return this.pokemon.find((p) => p.id === this.selectedPokemonId) || null;
  }

  setSelectedPokemon(id: string) {
    console.log('setSelectedPokemon', id, this);
    this.selectedPokemonId = id;
    this.selectedSpeciesId = this.selectedPokemon?.species[0].id || '';
  }

  get selectedSpecies() {
    return (
      this.selectedPokemon?.species.find(
        (s) => s.id === this.selectedSpeciesId
      ) || null
    );
  }

  get selectedSpeciesIdx() {
    if (!this.selectedPokemon) {
      return -1;
    }
    return this.selectedPokemon.species.findIndex(
      (s) => s.id === this.selectedSpeciesId
    );
  }

  get availableSpecies() {
    return this.selectedPokemon?.species;
  }

  addSpecies() {
    const pokemon = this.selectedPokemon;
    if (pokemon) {
      const newSpecies = new PokemonSpeciesData({
        ...this.selectedSpecies,
        species: `${this.selectedSpecies?.species || ''}_NEW`,
      });
      newSpecies.manualSpecies = true;
      pokemon.species = [...pokemon.species, newSpecies];
      this.selectedSpeciesId = newSpecies.id;
    }
  }
}

export const PokemonStoreContext = React.createContext(
  new PokemonStore(window.electron.ipcRenderer)
);
export const usePokemonStoreContext = () =>
  React.useContext(PokemonStoreContext);
