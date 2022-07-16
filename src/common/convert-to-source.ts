import { isString, uniq, uniqBy } from 'lodash';
import { z } from 'zod';
import { BaseStats } from './file-handlers/files/base-stats';
import { CryTable } from './file-handlers/files/cry-table';
import { EggMovesStructure } from './file-handlers/files/egg-moves';
import { EnemyElevationTable } from './file-handlers/files/enemy-elevation-table';
import { EvolutionTable } from './file-handlers/files/evolution-table';
import { FootprintTable } from './file-handlers/files/footprint-table';
import { HabitatTable } from './file-handlers/files/habitat-table';
import { IconPaletteTable } from './file-handlers/files/icon-palette-table';
import { IconTable } from './file-handlers/files/icon-table';
import { ItemAnimationTable } from './file-handlers/files/item-animation-table';
import { Learnsets } from './file-handlers/files/learnsets';
import {
  CompressedSpritePalette,
  PaletteTable,
} from './file-handlers/files/palette-table';
import {
  PicCoords,
  PicCoordsTable,
} from './file-handlers/files/pic-coords-table';
import {
  CompressedSpriteSheet,
  PicTable,
} from './file-handlers/files/pic-table';
import { PokedexConsts } from './file-handlers/files/pokedex';
import { PokedexDataString } from './file-handlers/files/pokedex-data-string';
import { PokedexDataTable } from './file-handlers/files/pokedex-data-table';
import { PokedexOrders } from './file-handlers/files/pokedex-order';
import { PokemonNameTable } from './file-handlers/files/pokemon-name-table';
import { SpecialInserts } from './file-handlers/files/special-inserts';
import { SpeciesData } from './file-handlers/files/species';
import { SpeciesToPokedex } from './file-handlers/files/species-to-pokedex';
import { SpriteData } from './file-handlers/files/sprite-data';
import { getHabitatTable } from './habitats';
import { EvoByOtherSpecies, EvoByType, getMethodGroup } from './lookup-values';
import { getPokedexOrders } from './pokedex-orders';
import { AllPokemonData } from './pokemon-data.interface';
import { PokemonSourceData } from './pokemon-source-data.interface';
import { notUndefined } from './ts-utils';

function populateCoords(
  coords: Omit<PicCoords, 'species'> | undefined,
  species: string
) {
  if (coords) {
    return {
      ...coords,
      species,
      size: 0,
    };
  }
  return undefined;
}

function populatePic(
  sprite: string | undefined,
  species: string
): CompressedSpriteSheet | undefined {
  if (sprite) {
    return {
      sprite,
      species,
      size: 2048,
    };
  }
  return undefined;
}

function populatePalette(
  sprite: string | undefined,
  species: string
): CompressedSpritePalette | undefined {
  if (sprite) {
    return {
      sprite,
      species,
      unused: 0,
    };
  }
  return undefined;
}

export function convertToSource(data: AllPokemonData): PokemonSourceData {
  const { pokemon } = data;

  pokemon.sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  const pokedexDataTable: PokedexDataTable = {
    pokedexEntries: pokemon.map(
      ({
        nationalDex,
        nationalDexNumber,
        categoryName,
        height,
        weight,
        pokemonScale,
        pokemonOffset,
        trainerScale,
        trainerOffset,
        species: pSpecies,
      }) => ({
        nationalDex,
        nationalDexNumber,
        categoryName,
        height: Math.floor(height * 10),
        weight: Math.floor(weight * 10),
        description: pSpecies[0].dexEntryConst,
        unusedDescription: 0x8444cb1,
        pokemonScale,
        pokemonOffset,
        trainerScale,
        trainerOffset,
      })
    ),
    alternateDexEntries: pokemon.flatMap((p) =>
      p.species
        .slice(1)
        .map((s) => s.dexEntryConst)
        .filter(isString)
        .filter((s) => s !== p.species[0].dexEntryConst)
    ),
  };

  const pokemonSpecies = pokemon
    .flatMap((p) => p.species)
    .sort((a, b) => {
      if (a.isAdditional !== b.isAdditional) {
        return a.isAdditional ? 1 : -1;
      }
      return a.speciesNumber - b.speciesNumber;
    });

  const speciesData: SpeciesData[] = pokemonSpecies
    .filter(({ isAdditional }) => !isAdditional)
    .map(({ species, speciesNumber }) => ({
      species,
      number: speciesNumber,
    }));
  const additionalSpecies: SpeciesData[] = pokemonSpecies
    .filter(({ isAdditional }) => isAdditional)
    .map(({ species, speciesNumber }) => ({
      species,
      number: speciesNumber,
    }));

  const pokemonNameTable: PokemonNameTable = {
    pokemonNames: pokemonSpecies.map(({ name, nameConst }) => ({
      name,
      nameConst,
    })),
  };

  const speciesWithEntries = pokemon
    .flatMap((p) => [
      p.species[0],
      ...p.species.filter(
        (s) => s.dexEntryConst !== p.species[0].dexEntryConst
      ),
    ])
    .sort((a, b) => a.speciesNumber - b.speciesNumber);
  const pokedexDataString: PokedexDataString = {
    pokedexData: speciesWithEntries
      .map(({ dexEntry, dexEntryConst }) => {
        if (dexEntry && isString(dexEntryConst)) {
          return {
            dexEntry,
            dexEntryConst,
          };
        }
        return undefined;
      })
      .filter(notUndefined),
  };

  const speciesToPokedex: SpeciesToPokedex = {
    mappings: pokemon.flatMap((p) =>
      p.species
        .map((s) => ({
          nationalDex: p.nationalDex,
          species: s.species,
        }))
        .filter((s) => s.species !== 'NONE')
    ),
  };

  const nationalDexConsts = pokemon.map(
    ({ nationalDex, nationalDexNumber }) => ({
      nationalDex,
      number: nationalDexNumber,
    })
  );
  const dexEntryConsts = pokedexDataString.pokedexData.map(
    (s) => s.dexEntryConst
  );

  const pokedexConsts: PokedexConsts = {
    nationalDexConsts,
    dexEntryConsts,
    finalDexEntry: nationalDexConsts[nationalDexConsts.length - 1].nationalDex,
  };

  const frontSprites = uniq(
    pokemonSpecies.map((s) => s.frontSprite).filter(notUndefined)
  );
  const backShinySprites = uniq(
    pokemonSpecies.map((s) => s.backShinySprite).filter(notUndefined)
  );
  const iconSprites = uniq(
    pokemonSpecies.map((s) => s.iconSprite).filter(notUndefined)
  );
  const spriteData: SpriteData = {
    frontSprites,
    frontSpritePals: frontSprites,
    backShinySprites,
    backShinySpritePals: backShinySprites,
    iconSprites,
  };
  const frontPicCoords: PicCoordsTable = {
    picCoords: pokemonSpecies
      .map((p) => populateCoords(p.frontCoords, p.species))
      .filter(notUndefined),
  };
  const backPicCoords: PicCoordsTable = {
    picCoords: pokemonSpecies
      .map((p) => populateCoords(p.backCoords, p.species))
      .filter(notUndefined),
  };
  const frontPicTable: PicTable = {
    pics: pokemonSpecies
      .map((p) => populatePic(p.frontSprite, p.species))
      .filter(notUndefined),
  };
  const backPicTable: PicTable = {
    pics: pokemonSpecies
      .map((p) => populatePic(p.backShinySprite, p.species))
      .filter(notUndefined),
  };
  const iconTable: IconTable = {
    icons: pokemonSpecies
      .map((p) =>
        p.iconSprite ? { species: p.species, icon: p.iconSprite } : undefined
      )
      .filter(notUndefined),
  };
  const paletteTable: PaletteTable = {
    palettes: pokemonSpecies
      .map((p) => populatePalette(p.frontSprite, p.species))
      .filter(notUndefined),
  };
  const shinyPaletteTable: PaletteTable = {
    palettes: pokemonSpecies
      .map((p) => populatePalette(p.backShinySprite, p.species))
      .filter(notUndefined),
  };
  const iconPaletteTable: IconPaletteTable = {
    iconPalettes: pokemonSpecies
      .map((p) =>
        p.iconPalette != null
          ? { species: p.species, palette: p.iconPalette }
          : undefined
      )
      .filter(notUndefined),
  };

  const baseStats: BaseStats = {
    baseStats: pokemonSpecies
      .map((p) =>
        p.baseStats
          ? {
              ...p.baseStats,
              species: p.species,
              noFlip: p.baseStats.type1 ? true : undefined,
            }
          : undefined
      )
      .filter(notUndefined),
  };
  const evolutionTable: EvolutionTable = {
    evolutions: pokemonSpecies
      .map((p) =>
        p.evolutions
          ? {
              species: p.species,
              evolutions: p.evolutions.map((evo) => {
                const methodGroup = getMethodGroup(evo.method);
                switch (methodGroup) {
                  case 'otherSpecies':
                    return {
                      ...(evo as z.infer<typeof EvoByOtherSpecies>),
                      param: `SPECIES_${evo.param}`,
                    };
                  case 'type':
                    return {
                      ...(evo as z.infer<typeof EvoByType>),
                      param: `TYPE_${evo.param}`,
                    };
                  default:
                    return evo;
                }
              }),
            }
          : undefined
      )
      .filter(notUndefined),
  };
  const learnsets: Learnsets = {
    learnsets: uniqBy(
      pokemonSpecies
        .map((p) =>
          p.learnset && p.learnsetConst
            ? {
                learnset: p.learnsetConst,
                levelUpMoves: p.learnset,
              }
            : undefined
        )
        .filter(notUndefined),
      'learnset'
    ),
    learnsetConsts: pokemonSpecies
      .map((p) =>
        p.learnsetConst
          ? {
              species: p.species,
              learnset: p.learnsetConst,
            }
          : undefined
      )
      .filter(notUndefined),
  };
  const eggMoves: EggMovesStructure = {
    eggMoves: pokemonSpecies
      .map((p) =>
        p.eggMoves
          ? {
              species: p.species,
              moves: p.eggMoves,
            }
          : undefined
      )
      .filter(notUndefined),
  };

  const cryTable: CryTable = {
    cryTable: pokemonSpecies
      .map((p) =>
        p.cryData ? { ...p.cryData, species: p.species, type: 0x20 } : undefined
      )
      .filter(notUndefined),
  };
  const cryTable2: CryTable = {
    cryTable: pokemonSpecies
      .map((p) =>
        p.cryData ? { ...p.cryData, species: p.species, type: 0x30 } : undefined
      )
      .filter(notUndefined),
  };

  const footprintTable: FootprintTable = {
    footprints: pokemonSpecies
      .map((p) =>
        p.footprint ? { species: p.species, footprint: p.footprint } : undefined
      )
      .filter(notUndefined),
  };

  const itemAnimationTable: ItemAnimationTable = {
    itemAnimations: pokemonSpecies
      .map((p) =>
        p.itemAnimation ? { ...p.itemAnimation, species: p.species } : undefined
      )
      .filter(notUndefined),
  };

  const enemyElevationTable: EnemyElevationTable = {
    elevations: pokemonSpecies
      .map((p) =>
        p.enemyElevation != null
          ? { species: p.species, elevation: p.enemyElevation }
          : undefined
      )
      .filter(notUndefined),
  };

  const specialInserts: SpecialInserts = {
    finalDexEntry: data.lastNationalDex,
  };

  const pokedexOrders: PokedexOrders = getPokedexOrders(data);

  const habitats: HabitatTable = getHabitatTable(pokemonSpecies);

  return {
    pokedexDataTable,
    pokemonNameTable,
    pokedexDataString,
    species: {
      species: speciesData,
      lastEntry: speciesData[speciesData.length - 1].species,
      additionalSpecies,
    },
    pokedexConsts,
    speciesToPokedex,
    spriteData,
    frontPicCoords,
    backPicCoords,
    frontPicTable,
    backPicTable,
    iconTable,
    paletteTable,
    shinyPaletteTable,
    iconPaletteTable,

    baseStats,
    evolutionTable,
    learnsets,
    eggMoves,

    cryTable,
    cryTable2,
    footprintTable,
    itemAnimationTable,

    enemyElevationTable,
    pokedexOrders,
    specialInserts,

    habitatTable: habitats,
  };
}
