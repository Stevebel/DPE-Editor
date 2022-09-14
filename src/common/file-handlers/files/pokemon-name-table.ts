import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { messageHandler } from '../handlers/message-handler';
import { getProp } from '../handlers/struct-handler';

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
        folder: 'src',
        fileName: 'src/data/text/species_names.h',
      },
    ],
    schema: {
      pokemonNames: new ArrayHandler<PokemonName>({
        definition: 'const u8 gSpeciesNames[][POKEMON_NAME_LENGTH + 1]',
        indexProperty: 'nameConst',
        indexPrefix: 'SPECIES_',
        propHandler: getProp('name', messageHandler(10)),
      }),
    },
  };
