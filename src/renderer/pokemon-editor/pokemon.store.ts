/* eslint-disable max-classes-per-file */
import { cloneDeep, flatMap, omit } from 'lodash';
import { makeAutoObservable } from 'mobx';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { ZodError } from 'zod';
import { Evolution } from '../../common/file-handlers/files/evolution-table';
import { AnimFrame } from '../../common/file-handlers/files/front-pic-anims';
import { LevelUpMove } from '../../common/file-handlers/files/level-up-learnsets';
import { AppIPC } from '../../common/ipc.interface';
import {
  BaseStatData,
  IPokemonData,
  IPokemonSpeciesData,
  PokemonDataSchema,
  PokemonSpeciesDataSchema,
} from '../../common/pokemon-data.interface';
import { NestedPath } from '../../common/ts-utils';
import { snakeCaseToCamelCase } from '../../common/utils';
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

function formatSpriteConst(species: string) {
  return `${snakeCaseToCamelCase(species)}`;
}

function formatLearnsetConst(species: string) {
  return `${snakeCaseToCamelCase(species)}`;
}

function getEmptyGraphicEntry() {
  return {
    name: '',
    file: '',
  };
}

function getEmptyGraphics() {
  return {
    frontSprite: getEmptyGraphicEntry(),
    backSprite: getEmptyGraphicEntry(),
    palette: getEmptyGraphicEntry(),
    shinyPalette: getEmptyGraphicEntry(),
    iconSprite: getEmptyGraphicEntry(),
    iconPalette: 0,
  };
}

export class PokemonSpeciesData implements IPokemonSpeciesData {
  name = '';

  species = '';

  nameConst = '';

  cryConst = '';

  speciesNumber = -1;

  dexEntry = '';

  dexEntryConst = '';

  graphics = getEmptyGraphics();

  femaleGraphics: IPokemonSpeciesData['femaleGraphics'] | undefined;

  footprint = getEmptyGraphicEntry();

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

  frontAnimId = '';

  backAnimId = '';

  frontAnimFrames: AnimFrame[] = [];

  animationDelay = 0;

  enemyElevation = 0;

  baseStats = {} as BaseStatData;

  evolutions: Evolution[] = [];

  learnset: LevelUpMove[] = [];

  learnsetConst = '';

  eggMoves: string[] = [];

  isAdditional = false;

  regionalDexNumber = 0;

  id: string;

  // State
  manualSpecies = false;

  spriteConst = '';

  manualSpriteConst = false;

  manualLearnsetConst = false;

  hasFemaleGraphics = false;

  hasFrontAnim = false;

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
      const expectedSpriteConst = formatSpriteConst(this.species);
      this.spriteConst = this.graphics.frontSprite?.name || expectedSpriteConst;
      this.manualSpriteConst =
        this.regionalDexNumber == null ||
        this.species === 'NONE' ||
        this.spriteConst !== expectedSpriteConst;
      if (
        this.learnsetConst &&
        this.learnsetConst !== formatLearnsetConst(this.species)
      ) {
        this.manualLearnsetConst = true;
      }
      this.learnset?.forEach((l) => {
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
    this.nameConst = this.species;
    if (this.pokemon.species[0]?.speciesNumber === this.speciesNumber) {
      this.pokemon.updatePath(this.species, ['nationalDex']);
    }
    if (this.dexEntry && !this.dexEntryConst) {
      this.dexEntryConst = this.learnsetConst;
    }
    if (!this.manualLearnsetConst) {
      this.learnsetConst = formatLearnsetConst(this.species);
    }
    if (!this.manualSpriteConst) {
      this.setSpriteConst(formatSpriteConst(this.species));
    } else {
      this.performErrorCheck();
    }
  }

  setDexEntry(dexEntry: string) {
    console.log('Dex entry:', dexEntry);
    this.dexEntry = dexEntry;
    if (!this.dexEntryConst) {
      this.dexEntryConst = this.cryConst;
    }
    this.performErrorCheck();
  }

  setSpriteConst(spriteConst: string) {
    this.spriteConst = spriteConst;
    if (!this.manualSpriteConst) {
      this.setGraphics(spriteConst);
    }
    this.performErrorCheck();
  }

  setGraphics(spriteConst: string) {
    if (this.species === 'NONE') {
      console.log('NONE', this);
    }
    this.graphics = {
      frontSprite: {
        name: spriteConst,
        file: `${spriteConst.toLowerCase()}/${
          this.hasFrontAnim ? 'front_anim' : 'front'
        }`,
      },
      backSprite: {
        name: spriteConst,
        file: `${spriteConst.toLowerCase()}/back`,
      },
      palette: {
        name: spriteConst,
        file: `${spriteConst.toLowerCase()}/normal`,
      },
      shinyPalette: {
        name: spriteConst,
        file: `${spriteConst.toLowerCase()}/shiny`,
      },
      iconSprite: {
        name: spriteConst,
        file: `${spriteConst.toLowerCase()}/icon`,
      },
      iconPalette: this.graphics.iconPalette,
    };
    if (this.hasFemaleGraphics) {
      this.femaleGraphics = {
        frontSprite: {
          name: spriteConst,
          file: `${spriteConst.toLowerCase()}/${
            this.hasFrontAnim ? 'front_animf' : 'frontf'
          }`,
        },
        backSprite: {
          name: spriteConst,
          file: `${spriteConst.toLowerCase()}/backf`,
        },
        palette: {
          name: spriteConst,
          file: `${spriteConst.toLowerCase()}/normalf`,
        },
        shinyPalette: {
          name: spriteConst,
          file: `${spriteConst.toLowerCase()}/shinyf`,
        },
        iconSprite: {
          name: spriteConst,
          file: `${spriteConst.toLowerCase()}/icon`,
        },
        iconPalette: this.graphics.iconPalette,
      };
    }
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

  nationalDex = '';

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

  addPokemon(base?: IPokemonData) {
    let copyFrom = base;
    if (!copyFrom && this.selectedPokemon) {
      copyFrom = {
        ...this.selectedPokemon,
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
          speciesNumber: this.nextSpeciesNumber,
          name: `${copySpecies.name} Copy`,
          species: `${copySpecies.species}_COPY`,
          isAdditional: false,
        }),
      ];
    } else if (pokemon.species.length === 0) {
      const defaultSpecies = new PokemonSpeciesData(pokemon, {
        speciesNumber: this.nextSpeciesNumber,
      });
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
        speciesNumber: this.nextSpeciesNumber,
        graphics: getEmptyGraphics(),
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
