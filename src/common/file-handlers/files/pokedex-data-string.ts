import { SourceFileDefinition } from '../file-handler.interface';
import { StringDefinitionsHandler } from '../handlers/string-definitions-handler';

export interface PokedexDataString {
  pokedexData: PokedexData[];
}
export interface PokedexData {
  dexEntryConst: string;
  dexEntry: string;
}

export const PokedexDataStringSourceDef: SourceFileDefinition<PokedexDataString> =
  {
    location: [
      {
        folder: 'dpe',
        fileName: 'strings/Pokedex_Data.string',
      },
    ],
    schema: {
      pokedexData: new StringDefinitionsHandler<PokedexData>({
        constProperty: 'dexEntryConst',
        constPrefix: 'DEX_ENTRY_',
        stringProperty: 'dexEntry',
      }),
    },
  };
