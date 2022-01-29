import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { AddressOrConstHandler, ConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { messageHandler } from '../handlers/message-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

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

const descriptionConstHandler = new ConstHandler({
  prefix: 'DEX_ENTRY_',
});

export const PokedexDataSourceDef: SourceFileDefinition<PokedexDataTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Pokedex_Data_Table.c',
    },
  ],
  schema: {
    pokedexEntries: new ArrayHandler<PokedexEntry>({
      definition:
        'const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT]',
      indexProperty: 'nationalDex',
      indexPrefix: 'NATIONAL_DEX_',
      itemHandler: new StructHandler({
        props: [
          getProp('categoryName', messageHandler()),
          getProp('height', IntHandler),
          getProp('weight', IntHandler),
          getProp(
            'description',
            new AddressOrConstHandler(descriptionConstHandler)
          ),
          getProp(
            'unusedDescription',
            new AddressOrConstHandler(descriptionConstHandler)
          ),
          getProp('pokemonScale', IntHandler),
          getProp('pokemonOffset', IntHandler),
          getProp('trainerScale', IntHandler),
          getProp('trainerOffset', IntHandler),
        ],
      }),
    }),
    alternateDexEntries: new FunctionArrayHandler({
      definition: 'const struct AlternateDexEntries gAlternateDexEntries[]',
      functionName: 'ALTERNATE_ENTRY',
      terminator: '{SPECIES_TABLES_TERMIN, 0}',
    }),
  },
};
