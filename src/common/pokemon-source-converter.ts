import { BaseStats } from './file-handlers/files/base-stats';
import { CryTable } from './file-handlers/files/cry-table';
import { EggMovesStructure } from './file-handlers/files/egg-moves';
import { EnemyElevationTable } from './file-handlers/files/enemy-elevation-table';
import { EvolutionTable } from './file-handlers/files/evolution-table';
import { FootprintTable } from './file-handlers/files/footprint-table';
import { IconPaletteTable } from './file-handlers/files/icon-palette-table';
import { IconTable } from './file-handlers/files/icon-table';
import { ItemAnimationTable } from './file-handlers/files/item-animation-table';
import { Learnsets } from './file-handlers/files/learnsets';
import {
  CompressedSpritePalette,
  PaletteTable
} from './file-handlers/files/palette-table';
import {
  PicCoords,
  PicCoordsTable
} from './file-handlers/files/pic-coords-table';
import {
  CompressedSpriteSheet,
  PicTable
} from './file-handlers/files/pic-table';
import { PokedexConsts } from './file-handlers/files/pokedex';
import { PokedexDataString } from './file-handlers/files/pokedex-data-string';
import { PokedexDataTable } from './file-handlers/files/pokedex-data-table';
import { PokedexOrders } from './file-handlers/files/pokedex-order';
import { PokemonNameTable } from './file-handlers/files/pokemon-name-table';
import { SpecialInserts } from './file-handlers/files/special-inserts';
import { SpeciesToPokedex } from './file-handlers/files/species-to-pokedex';
import { SpriteData } from './file-handlers/files/sprite-data';
import { getPokedexOrders } from './pokedex-orders';
import {
  AllPokemonData,
  IPokemonData,
  IPokemonSpeciesData
} from './pokemon-data.interface';
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
  const { pokemon, species } = data;

  const pokedexDataTable: PokedexDataTable = {
    pokedexEntries: pokemon.map(
      ({
        nationalDex,
        nationalDexNumber,
        categoryName,
        height,
        weight,
        description,
        pokemonScale,
        pokemonOffset,
        trainerScale,
        trainerOffset,
      }) => ({
        nationalDex,
        nationalDexNumber,
        categoryName,
        height,
        weight,
        description,
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
        .filter(notUndefined)
    ),
  };

  const pokemonSpecies = pokemon
    .flatMap((p) => p.species)
    .sort((a, b) => a.speciesNumber - b.speciesNumber);

  const pokemonNameTable: PokemonNameTable = {
    pokemonNames: pokemonSpecies.map(({ name, nameConst }) => ({
      name,
      nameConst,
    })),
  };

  const pokedexDataString: PokedexDataString = {
    pokedexData: pokemonSpecies
      .map(({ dexEntry, dexEntryConst }) => {
        if (dexEntry && dexEntryConst) {
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
      p.species.map((s) => ({
        nationalDex: p.nationalDex,
        species: s.species,
      }))
    ),
  };

  const dexEntryConsts = pokemonSpecies
    .map((s) => s.dexEntryConst)
    .filter(notUndefined);
  const pokedexConsts: PokedexConsts = {
    nationalDexConsts: pokemon.map(({ nationalDex, nationalDexNumber }) => ({
      nationalDex,
      number: nationalDexNumber,
    })),
    dexEntryConsts,
    finalDexEntry: dexEntryConsts[data.lastNationalDex],
  };

  const frontSprites = pokemonSpecies
    .map((s) => s.frontSprite)
    .filter(notUndefined);
  const backShinySprites = pokemonSpecies
    .map((s) => s.backShinySprite)
    .filter(notUndefined);
  const iconSprites = pokemonSpecies
    .map((s) => s.iconSprite)
    .filter(notUndefined);
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
        p.iconPalette
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
              noFlip: true,
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
              evolutions: p.evolutions,
            }
          : undefined
      )
      .filter(notUndefined),
  };
  const learnsets: Learnsets = {
    learnsets: pokemonSpecies
      .map((p) =>
        p.learnset
          ? {
              species: p.species,
              levelUpMoves: p.learnset,
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
        p.enemyElevation
          ? { species: p.species, elevation: p.enemyElevation }
          : undefined
      )
      .filter(notUndefined),
  };

  const specialInserts: SpecialInserts = {
    finalDexEntry: data.lastNationalDex,
  };

  const pokedexOrders: PokedexOrders = getPokedexOrders(data);

  return {
    pokedexDataTable,
    pokemonNameTable,
    pokedexDataString,
    species: {
      species,
      lastEntry: species[species.length - 1].species,
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
  };
}

export function formatSourceData(
  sourceData: PokemonSourceData
): AllPokemonData {
  const {
    pokedexDataTable,
    pokemonNameTable,
    pokedexDataString,
    species,
    pokedexConsts,
    speciesToPokedex,
    frontPicCoords,
    backPicCoords,
    frontPicTable,
    backPicTable,
    iconTable,
    iconPaletteTable,

    baseStats: allBaseStats,
    evolutionTable,
    learnsets: allLearnsets,
    eggMoves: allEggMoves,

    cryTable,
    footprintTable,
    itemAnimationTable,

    enemyElevationTable,
    specialInserts,
  } = sourceData;

  const pokedexToSpecies: { [key: string]: string[] } = {};
  speciesToPokedex.mappings.forEach(({ species: s, nationalDex }) => {
    pokedexToSpecies[nationalDex] = pokedexToSpecies[nationalDex] || [];
    pokedexToSpecies[nationalDex].push(s);
  });

  const pokemon: IPokemonData[] = pokedexDataTable.pokedexEntries.map(
    ({
      nationalDex,
      description,
      height,
      weight,
      categoryName,
      pokemonScale,
      pokemonOffset,
      trainerScale,
      trainerOffset,
    }) => {
      const nationDexConst = pokedexConsts.nationalDexConsts.find(
        (c) => c.nationalDex === nationalDex
      );
      if (!nationDexConst) {
        throw new Error(`No national dex const for ${nationalDex}`);
      }
      const nationalDexNumber = nationDexConst.number;
      const pokemonSpecies: IPokemonSpeciesData[] = pokedexToSpecies[
        nationalDex
      ].map((speciesName) => {
        const sp = species.species.find((s) => s.species === speciesName);
        if (!sp) {
          throw new Error(`Could not find species ${speciesName}`);
        }
        const name = pokemonNameTable.pokemonNames[sp.number];
        const dexEntry = pokedexDataString.pokedexData.find(
          (c) => c.dexEntryConst === speciesName
        );

        const frontSprite = frontPicTable.pics.find(
          (pic) => pic.species === speciesName
        )?.sprite;
        const backShinySprite = backPicTable.pics.find(
          (pic) => pic.species === speciesName
        )?.sprite;
        const iconSprite = iconTable.icons.find(
          (icon) => icon.species === speciesName
        )?.icon;
        const iconPalette = iconPaletteTable.iconPalettes.find(
          (palette) => palette.species === speciesName
        )?.palette;

        const frontCoords = frontPicCoords.picCoords.find(
          (c) => c.species === speciesName
        );
        const backCoords = backPicCoords.picCoords.find(
          (c) => c.species === speciesName
        );
        const enemyElevation = enemyElevationTable.elevations.find(
          (e) => e.species === speciesName
        )?.elevation;

        const baseStats = allBaseStats.baseStats.find(
          (b) => b.species === speciesName
        );
        const evolutions = evolutionTable.evolutions.find(
          (e) => e.species === speciesName
        )?.evolutions;
        const learnset = allLearnsets.learnsets.find(
          (l) => l.species === speciesName
        )?.levelUpMoves;
        const eggMoves = allEggMoves.eggMoves.find(
          (e) => e.species === speciesName
        )?.moves;

        const cryData = cryTable.cryTable.find(
          (c) => c.species === speciesName
        );
        const footprint = footprintTable.footprints.find(
          (f) => f.species === speciesName
        )?.footprint;
        const itemAnimation = itemAnimationTable.itemAnimations.find(
          (i) => i.species === speciesName
        );

        return {
          species: speciesName,
          speciesNumber: sp.number,

          name: name.name,
          nameConst: name.nameConst,

          dexEntry: dexEntry?.dexEntry,
          dexEntryConst: dexEntry?.dexEntryConst,

          frontSprite,
          backShinySprite,
          iconSprite,
          iconPalette,

          frontCoords,
          backCoords,
          enemyElevation,

          baseStats,
          evolutions,
          learnset,
          eggMoves,

          cryData,
          footprint,
          itemAnimation,
        };
      });

      return {
        nationalDex,
        nationalDexNumber,

        categoryName,
        height,
        weight,
        description,
        pokemonScale,
        pokemonOffset,
        trainerScale,
        trainerOffset,

        species: pokemonSpecies,
      };
    }
  );

  return {
    pokemon,
    species: species.species,
    lastNationalDex: specialInserts.finalDexEntry,
  };
}
