/* eslint-disable no-case-declarations */
import { z } from 'zod';
import { EvoByOtherSpecies, EvoByType, getMethodGroup } from './lookup-values';
import {
  AllPokemonData,
  IPokemonData,
  IPokemonSpeciesData,
} from './pokemon-data.interface';
import { PokemonSourceData } from './pokemon-source-data.interface';

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
  // console.log(pokemonConsts.speciesToNationalPokedexNum);

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
      let regionalDexNumber: number | undefined;
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

        if (regionalDexNumber === undefined) {
          const idx = pokedexConsts.regionalDexConsts.indexOf(speciesName);
          if (idx > -1) {
            regionalDexNumber = idx + 1;
          }
        }

        const frontSprite = frontPicTable.pics.find(
          (pic) => pic.species === speciesName
        )?.spriteConst;
        const backShinySprite = backPicTable.pics.find(
          (pic) => pic.species === speciesName
        )?.spriteConst;
        const iconSprite = iconTable.icons.find(
          (icon) => icon.species === speciesName
        )?.icon;
        const iconPalette = iconTable.palettes.find(
          (palette) => palette.species === speciesName
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

        const footprint = footprintTable.footprints.find(
          (f) => f.species === speciesName
        )?.footprint;

        return {
          species: speciesName,
          speciesNumber: sp.number,

          name: pokemonName.name,
          nameConst: pokemonName.nameConst,

          dexEntry,
          dexEntryConst: description,

          frontSprite,
          backShinySprite,
          iconSprite,
          iconPalette,

          frontCoords,
          backCoords,
          enemyElevation,

          baseStats,
          evolutions,
          learnsetConst: levelUpLearnsetConst,
          learnset: levelUpLearnset,
          teachableMovesConst: teachableLearnsetConst,
          teachableMoves: teachableLearnset,
          eggMoves,

          footprint,

          isAdditional,
          regionalDexNumber,
        };
      });

      return {
        nationalDex,
        nationalDexNumber,
        regionalDexNumber,

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
