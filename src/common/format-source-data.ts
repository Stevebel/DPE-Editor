/* eslint-disable no-case-declarations */
import { z } from 'zod';
import {
  EvoByOtherSpecies,
  EvoByType,
  getMethodGroup,
  HabitatLk,
} from './lookup-values';
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
    pokedexDataTable,
    pokemonNameTable,
    pokedexDataString,
    species,
    pokedexConsts,
    pokedexOrders,
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
    habitatTable,
  } = sourceData;

  const pokedexToSpecies: { [key: string]: string[] } = {};
  species.species.forEach((s, i) => {
    s.index = i;
  });
  species.additionalSpecies.forEach((s, i) => {
    s.index = i + species.species.length;
  });
  speciesToPokedex.mappings.push({
    nationalDex: 'NONE',
    species: 'NONE',
  });
  speciesToPokedex.mappings.forEach(({ species: s, nationalDex }) => {
    pokedexToSpecies[nationalDex] = pokedexToSpecies[nationalDex] || [];
    pokedexToSpecies[nationalDex].push(s);
  });
  const { alternateDexEntries } = pokedexDataTable;
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
      let regionalDexNumber: number | undefined;
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
        const dexEntryConst =
          alternateDexEntries.find((a) => a === speciesName) || description;
        const dexEntry = pokedexDataString.pokedexData.find(
          (c) => c.dexEntryConst === dexEntryConst
        )?.dexEntry;

        if (regionalDexNumber === undefined) {
          const idx = pokedexOrders.regional.indexOf(speciesName);
          if (idx > -1) {
            regionalDexNumber = idx + 1;
          }
        }

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
        const enemyElevation =
          enemyElevationTable.elevations.find((e) => e.species === speciesName)
            ?.elevation || 0;

        const baseStats = allBaseStats.baseStats.find(
          (b) => b.species === speciesName
        );
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

        const learnsetConst = allLearnsets.learnsetConsts.find(
          (l) => l.species === speciesName
        )?.learnset;
        const learnset = allLearnsets.learnsets.find(
          (l) => l.learnset === learnsetConst
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
        const rawHabitat = habitatTable.pages.find(
          (pg) => pg.species.indexOf(speciesName) >= 0
        )?.name;
        const habitat = rawHabitat
          ? (rawHabitat.substring(0, rawHabitat.indexOf('Page')) as HabitatLk)
          : undefined;

        return {
          species: speciesName,
          speciesNumber: sp.number,

          name: pokemonName.name,
          nameConst: pokemonName.nameConst,

          dexEntry,
          dexEntryConst,

          frontSprite,
          backShinySprite,
          iconSprite,
          iconPalette,

          frontCoords,
          backCoords,
          enemyElevation,

          baseStats,
          evolutions,
          learnsetConst,
          learnset,
          eggMoves,

          cryData,
          footprint,
          itemAnimation,

          isAdditional,
          habitat,
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
    lastNationalDex: specialInserts.finalDexEntry,
  };
}
