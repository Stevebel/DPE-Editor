import { SourceFileDefinition } from '../file-handler.interface';
import { AddressOrConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { messageHandler } from '../handlers/message-handler';
import { IntHandler } from '../handlers/number-handlers';
import { StructIndexedArrayHandler, structProp } from '../handlers/struct-array-handler';

export interface PokedexDataTable {
  pokedexEntries: PokedexEntry[];
  alternateDexEntries: string[];
}
export interface PokedexEntry {
  nationalDex: string;
  categoryName: string;
  height: number;
  weight: number;
  description: string | number;
  unusedDescription: string | number;
  pokemonScale: number;
  pokemonOffset: number;
  trainerScale: number;
  trainerOffset: number;
}

export const PokedexDataSourceDef: SourceFileDefinition<PokedexDataTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Pokedex_Data_Table.c',
    },
  ],
  schema: {
    pokedexEntries: new StructIndexedArrayHandler<PokedexEntry>({
      definition:
        'const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT]',
      indexProperty: 'nationalDex',
      indexPrefix: 'NATIONAL_DEX_',
      structProps: [
        structProp('categoryName', messageHandler()),
        structProp('height', IntHandler),
        structProp('weight', IntHandler),
        structProp('description', AddressOrConstHandler),
        structProp('unusedDescription', AddressOrConstHandler),
        structProp('pokemonScale', IntHandler),
        structProp('pokemonOffset', IntHandler),
        structProp('trainerScale', IntHandler),
        structProp('trainerOffset', IntHandler),
      ],
    }),
    alternateDexEntries: new FunctionArrayHandler({
      definition: 'const struct AlternateDexEntries gAlternateDexEntries[]',
      functionName: 'ALTERNATE_ENTRY',
      terminator: '{SPECIES_TABLES_TERMIN, 0}',
    }),
  },
};
