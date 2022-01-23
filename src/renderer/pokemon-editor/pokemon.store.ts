/* eslint-disable max-classes-per-file */
import { getObserverTree, makeAutoObservable } from 'mobx';
import React from 'react';
import { v4 as uuid } from 'uuid';
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
} from '../../common/pokemon-data.interface';

function formatSpeciesConst(species: string): string {
  return species
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_$/, '')
    .toUpperCase();
}

export class PokemonSpeciesData implements IPokemonSpeciesData {
  name = '';

  species = '';

  nameConst = '';

  speciesNumber = -1;

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

  id: string;

  // State
  manualSpecies = false;

  constructor(data?: Partial<IPokemonSpeciesData>, id = uuid()) {
    makeAutoObservable(this);
    if (data) {
      Object.assign(this, data);
      if (this.species !== formatSpeciesConst(this.name)) {
        this.manualSpecies = true;
      }
    }
    this.id = id;
  }

  setPokemonName(name: string) {
    this.name = name;
    if (!this.manualSpecies) {
      this.setSpeciesConst(name);
    }
  }

  setSpeciesConst(species: string) {
    this.species = formatSpeciesConst(species);
    this.nameConst = this.species;
  }
}

export class PokemonData implements IPokemonData {
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

  constructor(data?: Partial<IPokemonData>, id = uuid()) {
    makeAutoObservable(this, {
      id: false,
    });

    this.id = id;
    if (data) {
      Object.assign(this, {
        ...data,
        species:
          data.species?.map((species) => new PokemonSpeciesData(species)) || [],
      });
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
      console.log('dependencies', getObserverTree(this, 'selectedPokemonId'));
    });
  }

  addPokemon(data?: IPokemonData) {
    const pokemon = new PokemonData(data);
    this.pokemon = [...this.pokemon, pokemon];
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

  get availableSpecies() {
    return this.selectedPokemon?.species;
  }

  addSpecies(species: Partial<IPokemonSpeciesData>) {
    const pokemon = this.selectedPokemon;
    if (pokemon) {
      pokemon.species = [...pokemon.species, new PokemonSpeciesData(species)];
    }
  }
}

export const PokemonStoreContext = React.createContext(
  new PokemonStore(window.electron.ipcRenderer)
);
export const usePokemonStoreContext = () =>
  React.useContext(PokemonStoreContext);
