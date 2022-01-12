import { SourceFileHandler } from 'main/source-file-handler';
import { SourceFileDefinition } from './file-handlers/file-handler.interface';
import {
  PokedexConsts,
  PokedexConstsSourceDef,
} from './file-handlers/files/pokedex';
import {
  PokedexDataString,
  PokedexDataStringSourceDef,
} from './file-handlers/files/pokedex-data-string';
import {
  PokedexDataSourceDef,
  PokedexDataTable,
} from './file-handlers/files/pokedex-data-table';
import {
  PokemonNameTable,
  PokemonNameTableSourceDef,
} from './file-handlers/files/pokemon-name-table';
import { SpeciesData, SpeciesSourceDef } from './file-handlers/files/species';
import {
  SpeciesToPokedex,
  SpeciesToPokedexSourceDef,
} from './file-handlers/files/species-to-pokedex';

export const SOURCE_DEFS = {
  pokedexDataTable: PokedexDataSourceDef,
  pokemonNameTable: PokemonNameTableSourceDef,
  pokedexDataString: PokedexDataStringSourceDef,
  species: SpeciesSourceDef,
  pokedexConsts: PokedexConstsSourceDef,
  speciesToPokedex: SpeciesToPokedexSourceDef,
} as const;

export type SourceDefStruct = typeof SOURCE_DEFS;

export type SourceDefReturnType<K extends keyof SourceDefStruct> =
  SourceDefStruct[K] extends SourceFileDefinition<infer T> ? T : never;

export type PokemonSourceHandlers = {
  -readonly [K in keyof SourceDefStruct]: SourceFileHandler<
    SourceDefReturnType<K>
  >;
};

export type PokemonSourceData = {
  -readonly [K in keyof SourceDefStruct]: SourceDefReturnType<K>;
};

export type AllPokemonData = {
  pokemon: PokemonData[];
  species: SpeciesData[];

  source?: PokemonSourceData;
};

export type PokemonData = {
  nationalDex: string;
  regionalDexNumber?: number;
  nationalDexNumber: number;

  // Pokédex data
  categoryName: string;
  height: number;
  weight: number;
  description: string | number;
  pokemonScale: number;
  pokemonOffset: number;
  trainerScale: number;
  trainerOffset: number;

  // Species data
  species: PokemonSpeciesData[];
};

export type PokemonSpeciesData = {
  species: string;
  speciesNumber: number;

  name: string;
  nameConst: string;

  dexEntry?: string;
  dexEntryConst?: string;
};

function notUndefined<T>(x: T | undefined): x is T {
  return x != null;
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
  } = sourceData;

  const pokedexToSpecies: { [key: string]: string[] } = {};
  speciesToPokedex.mappings.forEach(({ species: s, nationalDex }) => {
    pokedexToSpecies[nationalDex] = pokedexToSpecies[nationalDex] || [];
    pokedexToSpecies[nationalDex].push(s);
  });

  const pokemon: PokemonData[] = pokedexDataTable.pokedexEntries.map(
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
      const pokemonSpecies: PokemonSpeciesData[] = pokedexToSpecies[
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

        return {
          species: speciesName,
          speciesNumber: sp.number,

          name: name.name,
          nameConst: name.nameConst,

          dexEntry: dexEntry?.dexEntry,
          dexEntryConst: dexEntry?.dexEntryConst,
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
  };
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
    finalDexEntry: dexEntryConsts[dexEntryConsts.length - 1],
  };

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
  };
}
