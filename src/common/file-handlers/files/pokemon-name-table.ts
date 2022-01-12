import { SourceFileDefinition } from '../file-handler.interface';
import { StringDefinitionsHandler } from '../handlers/string-definitions-handler';

export interface PokemonNameTable {
  pokemonNames: PokemonName[];
}
export interface PokemonName {
  nameConst: string;
  name: string;
}

export const PokemonNameTableSourceDef: SourceFileDefinition<PokemonNameTable> =
  {
    location: [
      {
        folder: 'dpe',
        fileName: 'strings/Pokemon_Name_Table.string',
      },
    ],
    schema: {
      pokemonNames: new StringDefinitionsHandler<PokemonName>({
        constProperty: 'nameConst',
        constPrefix: 'NAME_',
        stringProperty: 'name',
      }),
    },
  };
