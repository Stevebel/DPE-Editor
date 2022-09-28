import { isString, sortBy, uniqBy } from 'lodash';
import { z } from 'zod';
import { BaseStats } from './file-handlers/files/base-stats';
import { CryTable } from './file-handlers/files/cry-table';
import { EggMovesStructure } from './file-handlers/files/egg-moves';
import { EnemyElevationTable } from './file-handlers/files/enemy-elevation-table';
import { EvolutionTable } from './file-handlers/files/evolution-table';
import { FootprintTable } from './file-handlers/files/footprint-table';
import {
  AnimationCollectionDef,
  AnimationDef,
  AnimationMapping,
  FrontPicAnims,
} from './file-handlers/files/front-pic-anims';
import { GraphicsIncludes } from './file-handlers/files/graphics';
import { GraphicsData } from './file-handlers/files/graphics-data';
import { IconTable } from './file-handlers/files/icon-table';
import { LevelUpLearnsetPointers } from './file-handlers/files/level-up-learnset-pointers';
import { LevelUpLearnsets } from './file-handlers/files/level-up-learnsets';
import { PaletteTable } from './file-handlers/files/palette-table';
import {
  PicCoords,
  PicCoordsTable,
} from './file-handlers/files/pic-coords-table';
import { PicTable, SpeciesMapping } from './file-handlers/files/pic-table';
import { PokedexConsts } from './file-handlers/files/pokedex';
import { PokedexEntries } from './file-handlers/files/pokedex-entries';
import { PokedexOrders } from './file-handlers/files/pokedex-order';
import { PokedexText } from './file-handlers/files/pokedex-text';
import {
  AnimId,
  NationalDexMapping,
  PokemonConsts,
  SpeciesNumber,
} from './file-handlers/files/pokemon';
import { PokemonAnimation } from './file-handlers/files/pokemon-animation';
import { PokemonNameTable } from './file-handlers/files/pokemon-name-table';
import { SpeciesData } from './file-handlers/files/species';
import { TeachableLearnsetPointers } from './file-handlers/files/teachable-learnset-pointers';
import { TeachableLearnsets } from './file-handlers/files/teachable-learnsets';
import { EvoByOtherSpecies, EvoByType, getMethodGroup } from './lookup-values';
import { getPokedexOrders } from './pokedex-orders';
import { AllPokemonData } from './pokemon-data.interface';
import { PokemonSourceData } from './pokemon-source-data.interface';
import { notUndefined } from './ts-utils';

function populateCoords(
  coords: Omit<PicCoords, 'species'> | undefined,
  species: string
): PicCoords | undefined {
  if (coords) {
    return {
      ...coords,
      species,
    };
  }
  return undefined;
}

function populateMapping(
  name: string | undefined,
  species: string
): SpeciesMapping | undefined {
  if (name) {
    return {
      name,
      species,
    };
  }
  return undefined;
}

export function convertToSource(data: AllPokemonData): PokemonSourceData {
  const { pokemon } = data;

  pokemon.sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  const pokedexEntries: PokedexEntries = {
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
        pokemonScale,
        pokemonOffset,
        trainerScale,
        trainerOffset,
      })
    ),
  };

  const pokemonSpecies = pokemon
    .flatMap((p) =>
      p.species.map((s) => ({
        ...p,
        ...s,
      }))
    )
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
    pokemonNames: pokemonSpecies.map(({ name, species }) => ({
      name,
      nameConst: species,
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
  const pokedexText: PokedexText = {
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

  const nationalDexConsts = pokemon.map((p) => p.nationalDex);
  const regionalDexConsts = sortBy(
    pokemon.filter((p) => p.regionalDexNumber && p.regionalDexNumber > 0),
    (p) => p.regionalDexNumber
  ).map((p) => p.nationalDex);

  const pokedexConsts: PokedexConsts = {
    nationalDexConsts,
    nationalDexLastEntry: nationalDexConsts[nationalDexConsts.length - 1],
    regionalDexConsts,
    hoennDexLastEntry: regionalDexConsts[regionalDexConsts.length - 1],
  };

  const frontPics = uniqBy(
    pokemonSpecies.flatMap((s) =>
      [s.graphics?.frontSprite, s.femaleGraphics?.frontSprite].filter(
        notUndefined
      )
    ),
    (p) => p.name
  );
  const backPics = uniqBy(
    pokemonSpecies.flatMap((s) =>
      [s.graphics?.backSprite, s.femaleGraphics?.backSprite].filter(
        notUndefined
      )
    ),
    (p) => p.name
  );
  const iconSprites = uniqBy(
    pokemonSpecies.flatMap((s) =>
      [s.graphics?.iconSprite, s.femaleGraphics?.iconSprite].filter(
        notUndefined
      )
    ),
    (p) => p.name
  );
  const footprints = uniqBy(
    pokemonSpecies.map((s) => s.footprint).filter(notUndefined),
    (p) => p.name
  );
  const palettes = uniqBy(
    pokemonSpecies.flatMap((s) =>
      [s.graphics?.palette, s.femaleGraphics?.palette].filter(notUndefined)
    ),
    (p) => p.name
  );
  const shinyPalettes = uniqBy(
    pokemonSpecies.flatMap((s) =>
      [s.graphics?.shinyPalette, s.femaleGraphics?.shinyPalette].filter(
        notUndefined
      )
    ),
    (p) => p.name
  );
  // Add Egg Data
  frontPics.push({ name: 'Egg', file: 'egg/anim_front' });
  backPics.push({ name: 'Egg', file: 'egg/anim_front' });
  palettes.push({ name: 'Egg', file: 'egg/normal' });
  shinyPalettes.push({ name: 'Egg', file: 'egg/normal' });
  iconSprites.push({ name: 'Egg', file: 'egg/icon' });

  const graphicsData: GraphicsData = {
    frontPics,
    backPics,
    palettes,
    shinyPalettes,
    icons: iconSprites,
    footprints,
  };
  const graphics: GraphicsIncludes = {
    frontPics: frontPics.map((s) => s.name),
    backPics: backPics.map((s) => s.name),
    palettes: palettes.map((s) => s.name),
    shinyPalettes: shinyPalettes.map((s) => s.name),
    icons: iconSprites.map((s) => s.name),
    footprints: footprints.map((s) => s.name),
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
      .map((p) => populateMapping(p.graphics.frontSprite?.name, p.species))
      .filter(notUndefined),
    femalePics: pokemonSpecies
      .map((p) =>
        populateMapping(p.femaleGraphics?.frontSprite?.name, p.species)
      )
      .filter(notUndefined),
  };
  const backPicTable: PicTable = {
    pics: pokemonSpecies
      .map((p) => populateMapping(p.graphics.backSprite?.name, p.species))
      .filter(notUndefined),
    femalePics: pokemonSpecies
      .map((p) =>
        populateMapping(p.femaleGraphics?.backSprite?.name, p.species)
      )
      .filter(notUndefined),
  };
  const iconTable: IconTable = {
    icons: pokemonSpecies
      .map((p) => populateMapping(p.graphics.iconSprite?.name, p.species))
      .filter(notUndefined),
    iconsFemale: pokemonSpecies
      .map((p) =>
        populateMapping(p.femaleGraphics?.iconSprite?.name, p.species)
      )
      .filter(notUndefined),
    palettes: pokemonSpecies
      .map((p) =>
        p.graphics.iconPalette != null
          ? { species: p.species, palette: p.graphics.iconPalette }
          : undefined
      )
      .filter(notUndefined),
    palettesFemale: pokemonSpecies
      .map((p) =>
        p.femaleGraphics?.iconPalette != null
          ? { species: p.species, palette: p.femaleGraphics.iconPalette }
          : undefined
      )
      .filter(notUndefined),
  };
  const paletteTable: PaletteTable = {
    palettes: pokemonSpecies
      .map((p) => populateMapping(p.graphics.palette?.name, p.species))
      .filter(notUndefined),
    femalePalettes: pokemonSpecies
      .map((p) => populateMapping(p.femaleGraphics?.palette?.name, p.species))
      .filter(notUndefined),
  };
  const shinyPaletteTable: PaletteTable = {
    palettes: pokemonSpecies
      .map((p) => populateMapping(p.graphics.shinyPalette?.name, p.species))
      .filter(notUndefined),
    femalePalettes: pokemonSpecies
      .map((p) =>
        populateMapping(p.femaleGraphics?.shinyPalette?.name, p.species)
      )
      .filter(notUndefined),
  };
  const anims: AnimationDef[] = uniqBy(
    pokemonSpecies
      .map((p) =>
        p.frontAnimFrames && p.animConst
          ? {
              animConst: `${p.animConst}_1`,
              animFrames: p.frontAnimFrames,
            }
          : undefined
      )
      .filter(notUndefined),
    (a) => a.animConst
  );
  const animCollections: AnimationCollectionDef[] = uniqBy(
    pokemonSpecies
      .map((p) =>
        p.frontAnimFrames && p.animConst
          ? {
              animCollectionConst: p.animConst,
              anims: ['GeneralFrame0', `${p.animConst}_1`],
            }
          : undefined
      )
      .filter(notUndefined),
    (a) => a.animCollectionConst
  );
  const animTable: AnimationMapping[] = pokemonSpecies
    .map((p) =>
      p.frontAnimFrames && p.animConst
        ? {
            species: p.species,
            animCollectionConst: p.animConst,
          }
        : undefined
    )
    .filter(notUndefined);

  const frontPicAnims: FrontPicAnims = {
    anims,
    animCollections,
    animTable,
  };

  const pokemonAnimation: PokemonAnimation = {
    backAnims: pokemonSpecies
      .map((p) =>
        p.backAnimId
          ? {
              species: p.species,
              anim: p.backAnimId,
            }
          : undefined
      )
      .filter(notUndefined),
  };

  const animationDelays: SpeciesNumber[] = pokemonSpecies
    .map((p) =>
      p.animationDelay
        ? {
            speciesConst: p.species,
            num: p.animationDelay,
          }
        : undefined
    )
    .filter(notUndefined);

  const frontAnimIds: AnimId[] = pokemonSpecies
    .map((p) =>
      p.frontAnimId
        ? {
            speciesConst: p.species,
            anim: p.frontAnimId,
          }
        : undefined
    )
    .filter(notUndefined);

  const speciesToNationalPokedexNum: NationalDexMapping[] = pokemonSpecies.map(
    (p) => ({
      speciesConst: p.species,
      nationalDexConst: p.nationalDex,
    })
  );
  const speciesToHoennPokedexNum: string[] = sortBy(
    pokemonSpecies.filter(
      (p) => p.regionalDexNumber && p.regionalDexNumber > 0
    ),
    (p) => p.regionalDexNumber
  ).map((p) => p.nationalDex);

  const pokemonConsts: PokemonConsts = {
    animationDelays,
    frontAnimIds,
    speciesToHoennPokedexNum,
    hoennToNationalOrder: speciesToHoennPokedexNum,
    speciesToNationalPokedexNum,
  };

  const baseStats: BaseStats = {
    baseStats: pokemonSpecies
      .map((p) =>
        p.baseStats
          ? {
              ...p.baseStats,
              species: p.species,
            }
          : undefined
      )
      .filter(notUndefined),
  };
  const evolutionTable: EvolutionTable = {
    evolutions: pokemonSpecies
      .map((p) =>
        p.evolutions && p.evolutions.length > 0
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
  const levelUpLearnsets: LevelUpLearnsets = {
    learnsets: uniqBy(
      pokemonSpecies
        .map((p) =>
          p.learnset && p.learnsetConst
            ? {
                learnsetConst: p.learnsetConst,
                levelUpMoves: p.learnset,
              }
            : undefined
        )
        .filter(notUndefined),
      'learnsetConst'
    ),
  };
  const levelUpLearnsetPointers: LevelUpLearnsetPointers = {
    pointers: pokemonSpecies
      .map((p) =>
        p.learnset && p.learnsetConst
          ? {
              species: p.species,
              learnsetConst: p.learnsetConst,
            }
          : undefined
      )
      .filter(notUndefined),
  };
  const teachableLearnsets: TeachableLearnsets = {
    learnsets: uniqBy(
      pokemonSpecies
        .map((p) =>
          p.teachableMoves && p.teachableMovesConst
            ? {
                learnsetConst: p.teachableMovesConst,
                moves: p.teachableMoves,
              }
            : undefined
        )
        .filter(notUndefined),
      'learnsetConst'
    ),
  };
  const teachableLearnsetPointers: TeachableLearnsetPointers = {
    pointers: pokemonSpecies
      .map((p) =>
        p.teachableMovesConst
          ? {
              species: p.species,
              learnsetConst: p.teachableMovesConst,
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
    cries: pokemonSpecies
      .filter((p) => p.species !== 'NONE')
      .map((p) => p.cryConst)
      .filter(notUndefined),
    criesReverse: pokemonSpecies
      .filter((p) => p.species !== 'NONE')
      .map((p) => p.cryConst)
      .filter(notUndefined),
  };

  const footprintTable: FootprintTable = {
    footprints: pokemonSpecies
      .map((p) => populateMapping(p.footprint?.name, p.species))
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
  const pokedexOrders: PokedexOrders = getPokedexOrders(data);
  // Add Egg Data
  additionalSpecies.push({
    species: 'EGG',
    number: additionalSpecies.length + 1,
  });
  frontPicTable.pics.push({ species: 'EGG', name: 'Egg' });
  backPicTable.pics.push({ species: 'EGG', name: 'Egg' });
  paletteTable.palettes.push({ species: 'EGG', name: 'Egg' });
  shinyPaletteTable.palettes.push({ species: 'EGG', name: 'Egg' });
  footprintTable.footprints.push({ species: 'EGG', name: 'Bulbasaur' });
  iconTable.icons.push({ species: 'EGG', name: 'Egg' });
  iconTable.palettes.push({ species: 'EGG', palette: 1 });
  const eggCoords = {
    species: 'EGG',
    y_offset: 20,
    size: { width: 24, height: 24 },
  };
  backPicCoords.picCoords.push(eggCoords);
  frontPicCoords.picCoords.push(eggCoords);
  frontPicAnims.anims.push({
    animConst: 'EGG_1',
    animFrames: [
      { frame: 0, duration: 6 },
      { frame: 1, duration: 6 },
      { frame: 2, duration: 6 },
      { frame: 3, duration: 6 },
    ],
  });
  frontPicAnims.animCollections.push({
    animCollectionConst: 'EGG',
    anims: ['GeneralFrame0', 'EGG_1'],
  });
  frontPicAnims.animTable.push({
    species: 'EGG',
    animCollectionConst: 'EGG',
  });

  // Remove None
  pokemonConsts.speciesToNationalPokedexNum =
    pokemonConsts.speciesToNationalPokedexNum.filter(
      (p) => p.speciesConst !== 'NONE'
    );
  pokemonConsts.speciesToHoennPokedexNum =
    pokemonConsts.speciesToHoennPokedexNum.filter((p) => p !== 'NONE');
  pokemonConsts.hoennToNationalOrder =
    pokemonConsts.hoennToNationalOrder.filter((p) => p !== 'NONE');

  return {
    pokedexEntries,
    pokemonNameTable,
    pokedexText,
    species: {
      species: speciesData,
      lastCustomEntry: speciesData[speciesData.length - 1].species,
      lastEntry: additionalSpecies[additionalSpecies.length - 1].species,
      additionalSpecies,
    },
    pokedexConsts,
    pokemonConsts,
    graphicsData,
    graphics,
    frontPicAnims,
    frontPicCoords,
    backPicCoords,
    frontPicTable,
    backPicTable,
    iconTable,
    paletteTable,
    shinyPaletteTable,
    pokemonAnimation,

    baseStats,
    evolutionTable,
    levelUpLearnsets,
    levelUpLearnsetPointers,
    teachableLearnsets,
    teachableLearnsetPointers,
    eggMoves,

    cryTable,
    footprintTable,

    enemyElevationTable,
    pokedexOrders,
  };
}
