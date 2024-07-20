/* eslint-disable max-classes-per-file */
import { cloneDeep, flatMap, omit } from 'lodash';
import { makeAutoObservable } from 'mobx';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { ZodError } from 'zod';
import { Evolution } from '../../common/file-handlers/files/evolution-table';
import { AnimFrame } from '../../common/file-handlers/files/front-pic-anims';
import { AppIPC } from '../../common/ipc.interface';
import {
  ILearnset,
  IPokemonData,
  IPokemonSpeciesData,
  PokemonDataSchema,
  PokemonSpeciesDataSchema,
  PokemonType,
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

function formatSpriteFolder(species: string) {
  return species.toLowerCase();
}

export class PokemonSpeciesData implements IPokemonSpeciesData {
  name = '';

  species = '';

  speciesNumber = -1;

  baseHP = 0;

  baseAttack = 0;

  baseDefense = 0;

  baseSpAttack = 0;

  baseSpDefense = 0;

  baseSpeed = 0;

  types: PokemonType[] = ['NONE', 'NONE'];

  catchRate = 0;

  expYield = 0;

  evYield_HP = 0;

  evYield_Attack = 0;

  evYield_Defense = 0;

  evYield_SpAttack = 0;

  evYield_SpDefense = 0;

  evYield_Speed = 0;

  itemCommon = undefined;

  itemRare = undefined;

  genderRatio = 0;

  eggCycles = 0;

  friendship = 0;

  growthRate = '';

  eggGroups = ['NONE', 'NONE'];

  abilities = [null, null, null];

  bodyColor = 'GRAY';

  noFlip = false;

  graphicsFolder = '';

  frontCoords = {
    size: {
      width: 64,
      height: 64,
    },
    y_offset: 0,
  };

  backCoords = {
    size: {
      width: 64,
      height: 64,
    },
    y_offset: 0,
  };

  frontAnimId = undefined;

  backAnimId = undefined;

  frontAnimFrames: AnimFrame[] = [];

  animationDelay = 0;

  enemyElevation = 0;

  evolutions: Evolution[] = [];

  eggMoves: string[] = [];

  isAdditional = false;

  regionalDexNumber = 0;

  exclude = false;

  hasFemaleGraphics = false;

  hasFrontAnim = false;

  learnset = {} as ILearnset;

  id: string;

  // State
  manualSpecies = false;

  pokemon: PokemonData;

  errors: ZodError<typeof PokemonSpeciesDataSchema> | null = null;

  constructor(
    pokemon: PokemonData,
    data?: Partial<IPokemonSpeciesData>,
    id = uuid()
  ) {
    this.pokemon = pokemon;

    makeAutoObservable(this);
    if (data) {
      Object.assign(this, data);
      if (this.species !== formatSpeciesConst(this.name)) {
        this.manualSpecies = true;
      }
      if (!this.graphicsFolder) {
        this.graphicsFolder = formatSpriteFolder(this.species);
      }

      this.learnset?.levelUp?.forEach((l) => {
        l.id = uuid();
      });
      if (!this.evolutions) {
        this.evolutions = [];
      }
      this.evolutions.forEach((e) => {
        e.id = uuid();
      });

      this.setSpeciesConst(this.species);
    }
    this.id = id;
    this.performErrorCheck();
  }

  setPokemonName(name: string) {
    this.name = name;
    if (!this.manualSpecies) {
      this.setSpeciesConst(name);
    } else {
      this.performErrorCheck();
    }
  }

  setSpeciesConst(species: string) {
    this.species = formatSpeciesConst(species);
    this.graphicsFolder = formatSpriteFolder(this.species);
  }

  setGraphicsFolder(folder: string) {
    this.graphicsFolder = folder;
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
      this.errors = errorCheck.error as any;
    } else {
      this.errors = null;
    }
  }
}

export class PokemonData implements IPokemonData, CanUpdatePath {
  id: string;

  name = '';

  regionalDexNumber?: number;

  nationalDexNumber = 0;

  // Pokédex data
  categoryName = 'Unknown';

  height = 0;

  weight = 0;

  description: string | number = '';

  pokemonScale = 0;

  pokemonOffset = 0;

  trainerScale = 0;

  trainerOffset = 0;

  dexEntry = ['TODO'];

  dexEntryString = 'TODO';

  exclude = false;

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
        species: [],
      });
      if (data?.species) {
        this.species = data.species?.map(
          (species) => new PokemonSpeciesData(this, species)
        );
      }
      this.dexEntryString = this.dexEntry.join('\n');
    }
    this.id = id;

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
      this.errors = errorCheck.error as any;
    } else {
      this.errors = null;
    }
  }

  setDexEntry(entry: string) {
    this.dexEntryString = entry;
    this.dexEntry = entry?.split('\n') || [''];
    if (this.dexEntry.length > 4) {
      console.log('Truncating dex entry', this.dexEntry.slice());
      this.dexEntry = this.dexEntry.slice(0, 4);
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
      data.learnset.forEach((l) => {
        let species: PokemonSpeciesData | null = null;
        if (
          this.pokemon.some((pokemon) => {
            const found = pokemon.species.find((s) => s.species === l.species);
            if (found) {
              species = found;
              return true;
            }
            return false;
          })
        ) {
          species!.learnset = l;
        }
      });
    });
  }

  addPokemon(base?: IPokemonData) {
    let copyFrom = base;
    if (!copyFrom && this.selectedPokemon) {
      copyFrom = {
        ...this.selectedPokemon,
        exclude: false,
        dexEntry: ['TODO'],
      };
    }
    const pokemon = new PokemonData({
      ...copyFrom,
      nationalDexNumber: this.pokemon.length,
      regionalDexNumber: this.nextRegionalDexNumber,
    });
    if (copyFrom) {
      const copySpecies = {
        ...cloneDeep(omit(copyFrom.species[0], ['pokemon', 'frontSprite'])),
        pokemon,
      };
      pokemon.species = [
        new PokemonSpeciesData(pokemon, {
          ...copySpecies,
          name: `${copySpecies.name} Copy`,
          species: `${copySpecies.species}_COPY`,
          exclude: false,
        }),
      ];
    } else if (pokemon.species.length === 0) {
      const defaultSpecies = new PokemonSpeciesData(pokemon);
      pokemon.species = [defaultSpecies];
    }
    this.pokemon = [
      ...this.pokemon.filter((p) => p.regionalDexNumber != null),
      pokemon,
      ...this.pokemon.filter((p) => p.regionalDexNumber == null),
    ];
    this.setSelectedPokemon(pokemon.id);
    return pokemon;
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

  get allSpecies() {
    return flatMap(this.pokemon, (p) => p.species);
  }

  get nextSpeciesNumber() {
    return this.allSpecies.filter((s) => !s.isAdditional).length;
  }

  get nextRegionalDexNumber() {
    return this.pokemon.filter((p) => p.regionalDexNumber != null).length;
  }

  addSpecies() {
    const pokemon = this.selectedPokemon;
    if (pokemon) {
      const newSpecies = new PokemonSpeciesData(pokemon, {
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
