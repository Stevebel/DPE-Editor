/* eslint-disable no-case-declarations */
import { z } from 'zod';
import { GraphicsEntry } from './file-handlers/files/graphics-data';
import { SpeciesMapping } from './file-handlers/files/pic-table';
import { EvoByOtherSpecies, EvoByType, getMethodGroup } from './lookup-values';
import {
  AllPokemonData,
  IPokemonData,
  IPokemonSpeciesData,
} from './pokemon-data.interface';
import { PokemonSourceData } from './pokemon-source-data.interface';

function getGraphicFile(
  species: string,
  table: SpeciesMapping[],
  entries: GraphicsEntry[]
) {
  const name = table.find((pic) => pic.species === species)?.name;
  const file = entries.find((pic) => pic.name === name)?.file;
  if (name && file) {
    return {
      name,
      file,
    };
  }
  return undefined;
}

export function formatSourceData(
  sourceData: PokemonSourceData
): AllPokemonData {
  const {
    cryTable,
    enemyElevationTable,
    evolutionTable,
    footprintTable,
    frontPicAnims,
    graphicsData,
    graphics,
    iconTable,
    levelUpLearnsets,
    levelUpLearnsetPointers,
    paletteTable,
    shinyPaletteTable,
    backPicCoords,
    frontPicCoords,
    backPicTable,
    frontPicTable,
    pokedexEntries,
    pokedexOrders,
    pokedexText,
    pokedexConsts,
    pokemonAnimation,
    pokemonNameTable,
    pokemonConsts,
    species,
    teachableLearnsets,
    teachableLearnsetPointers,
    baseStats: allBaseStats,
    eggMoves: allEggMoves,
  } = sourceData;

  species.species.forEach((s, i) => {
    s.index = i;
  });
  species.additionalSpecies.forEach((s, i) => {
    s.index = i + species.species.length;
  });

  const pokedexToSpecies: { [key: string]: string[] } = {};
  pokemonConsts.speciesToNationalPokedexNum.forEach(
    ({ speciesConst: s, nationalDexConst: nationalDex }) => {
      pokedexToSpecies[nationalDex] = pokedexToSpecies[nationalDex] || [];
      pokedexToSpecies[nationalDex].push(s);
    }
  );
  pokedexToSpecies.NONE = ['NONE'];
  const pokemon: IPokemonData[] = pokedexEntries.pokedexEntries.map(
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
      const nationalDexNumber =
        pokedexConsts.nationalDexConsts.indexOf(nationalDex);
      if (nationalDexNumber < 0) {
        throw new Error(`No national dex const for ${nationalDex}`);
      }
      if (!pokedexToSpecies[nationalDex]) {
        throw new Error(`No species found for ${nationalDex}`);
      }
      const pokemonSpecies: IPokemonSpeciesData[] = pokedexToSpecies[
        nationalDex
      ].map((speciesName) => {
        let isAdditional = false;
        let sp = species.species.find((s) => s.species === speciesName);
        if (!sp) {
          sp = species.additionalSpecies.find((s) => s.species === speciesName);
          isAdditional = true;
        }
        if (!sp) {
          throw new Error(`Could not find species ${speciesName}`);
        }
        const pokemonName = pokemonNameTable.pokemonNames[sp.index!];
        const dexEntry = pokedexText.pokedexData.find(
          (c) => c.dexEntryConst === description
        )?.dexEntry;

        let regionalDexNumber: number | undefined;
        const idx = pokedexConsts.regionalDexConsts.indexOf(speciesName) + 1;
        if (idx > 0) {
          regionalDexNumber = idx + 1;
        }

        const frontSprite = getGraphicFile(
          speciesName,
          frontPicTable.pics,
          graphicsData.frontPics
        );
        const backSprite = getGraphicFile(
          speciesName,
          backPicTable.pics,
          graphicsData.backPics
        );
        const palette = getGraphicFile(
          speciesName,
          paletteTable.palettes,
          graphicsData.palettes
        );
        const shinyPalette = getGraphicFile(
          speciesName,
          shinyPaletteTable.palettes,
          graphicsData.palettes
        );
        const iconSprite = getGraphicFile(
          speciesName,
          iconTable.icons,
          graphicsData.icons
        );
        const footprint = getGraphicFile(
          speciesName,
          footprintTable.footprints,
          graphicsData.footprints
        );
        const iconPalette = iconTable.palettes.find(
          (p) => p.species === speciesName
        )?.palette;

        const femaleFrontSprite = getGraphicFile(
          speciesName,
          frontPicTable.femalePics,
          graphicsData.frontPics
        );
        const femaleBackSprite = getGraphicFile(
          speciesName,
          backPicTable.femalePics,
          graphicsData.backPics
        );
        const femalePalette = getGraphicFile(
          speciesName,
          paletteTable.femalePalettes,
          graphicsData.palettes
        );
        const femaleShinyPalette = getGraphicFile(
          speciesName,
          shinyPaletteTable.femalePalettes,
          graphicsData.palettes
        );
        const femaleIconSprite = getGraphicFile(
          speciesName,
          iconTable.iconsFemale,
          graphicsData.icons
        );
        const femaleIconPalette = iconTable.palettesFemale.find(
          (p) => p.species === speciesName
        )?.palette;

        const frontCoords = frontPicCoords.picCoords.find(
          (c) => c.species === speciesName
        );
        const backCoords = backPicCoords.picCoords.find(
          (c) => c.species === speciesName
        );
        const enemyElevation =
          enemyElevationTable.elevations.find((e) => e.species === speciesName)
            ?.elevation || 0;

        const baseStatsRaw = allBaseStats.baseStats.find(
          (b) => b.species === speciesName
        );
        if (!baseStatsRaw) {
          throw new Error(`No base stats for ${speciesName}`);
        }
        const baseStats = {
          ...baseStatsRaw,
          ability1: (baseStatsRaw.abilities || [])[0],
          ability2: (baseStatsRaw.abilities || [])[1],
          hiddenAbility: (baseStatsRaw.abilities || [])[2],
          item1: baseStatsRaw.itemCommon,
          item2: baseStatsRaw.itemRare,
        };
        const evolutions = evolutionTable.evolutions
          .find((e) => e.species === speciesName)
          ?.evolutions.map((evo) => {
            const methodGroup = getMethodGroup(evo.method);
            switch (methodGroup) {
              case 'otherSpecies':
                const evoByOtherSpecies = evo as z.infer<
                  typeof EvoByOtherSpecies
                >;
                return {
                  ...evoByOtherSpecies,
                  param: evoByOtherSpecies.param.replace('SPECIES_', ''),
                };
              case 'type':
                const evoByType = evo as z.infer<typeof EvoByType>;
                return {
                  ...evoByType,
                  param: evoByType.param.replace('TYPE_', ''),
                };
              default:
                return evo;
            }
          });

        const levelUpLearnsetConst = levelUpLearnsetPointers.pointers.find(
          (l) => l.species === speciesName
        )?.learnsetConst;
        const levelUpLearnset = levelUpLearnsets.learnsets.find(
          (l) => l.learnsetConst === levelUpLearnsetConst
        )?.levelUpMoves;
        const teachableLearnsetConst = teachableLearnsetPointers.pointers.find(
          (l) => l.species === speciesName
        )?.learnsetConst;
        const teachableLearnset = teachableLearnsets.learnsets.find(
          (l) => l.learnsetConst === teachableLearnsetConst
        )?.moves;

        const eggMoves = allEggMoves.eggMoves.find(
          (e) => e.species === speciesName
        )?.moves;

        const frontAnimId = pokemonConsts.frontAnimIds.find(
          (a) => a.speciesConst === speciesName
        )?.anim;

        const backAnimId = pokemonAnimation.backAnims.find(
          (a) => a.species === speciesName
        )?.anim;

        const animationDelay = pokemonConsts.animationDelays.find(
          (a) => a.speciesConst === speciesName
        )?.num;

        const out: IPokemonSpeciesData = {
          species: speciesName,
          speciesNumber: sp.number,
          name: pokemonName.name,
          nameConst: pokemonName.nameConst,
          prettyConst: description || levelUpLearnsetConst || '',
          dexEntry,
          dexEntryConst: description,
          graphics: {
            frontSprite,
            backSprite,
            palette,
            shinyPalette,
            iconSprite,
            iconPalette,
          },
          femaleGraphics:
            femaleFrontSprite || femalePalette
              ? {
                  frontSprite: femaleFrontSprite,
                  backSprite: femaleBackSprite,
                  palette: femalePalette,
                  shinyPalette: femaleShinyPalette,
                  iconSprite: femaleIconSprite,
                  iconPalette: femaleIconPalette,
                }
              : undefined,
          frontCoords,
          backCoords,
          enemyElevation,
          frontAnimId,
          backAnimId,
          animationDelay,
          baseStats,
          evolutions,
          learnset: levelUpLearnset,
          learnsetConst: levelUpLearnsetConst,
          teachableMoves: teachableLearnset,
          teachableMovesConst: teachableLearnsetConst,
          eggMoves,
          footprint,
          isAdditional,
          regionalDexNumber,
        };
        return out;
      });

      return {
        nationalDex,
        nationalDexNumber,
        regionalDexNumber: pokemonSpecies[0].regionalDexNumber,

        categoryName,
        height: height / 10,
        weight: weight / 10,
        description,
        pokemonScale,
        pokemonOffset,
        trainerScale,
        trainerOffset,

        species: pokemonSpecies,
      };
    }
  );

  pokemon.sort(
    (a, b) =>
      (a.regionalDexNumber || 1000) * 1000 +
      a.nationalDexNumber -
      ((b.regionalDexNumber || 1000) * 1000 + b.nationalDexNumber)
  );
  // pokemon.sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);

  return {
    pokemon,
    species: species.species,
  };
}
