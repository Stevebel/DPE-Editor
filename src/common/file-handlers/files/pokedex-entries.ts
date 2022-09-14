import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { messageHandler } from '../handlers/message-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export interface PokedexEntries {
  pokedexEntries: PokedexEntry[];
}
export interface PokedexEntry {
  nationalDex: string;
  categoryName: string;
  height: number;
  weight: number;
  description: string;
  pokemonScale: number;
  pokemonOffset: number;
  trainerScale: number;
  trainerOffset: number;
}

const descriptionConstHandler = new ConstHandler({
  prefix: 'g',
  suffix: 'PokedexText',
});

export const PokedexEntriesSourceDef: SourceFileDefinition<PokedexEntries> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/pokemon/pokedex_entries.h',
    },
  ],
  schema: {
    pokedexEntries: new ArrayHandler<PokedexEntry>({
      definition: 'const struct PokedexEntry gPokedexEntries[]',
      indexProperty: 'nationalDex',
      indexPrefix: 'NATIONAL_DEX_',
      itemHandler: new StructHandler({
        props: [
          getProp('categoryName', messageHandler()),
          getProp('height', IntHandler),
          getProp('weight', IntHandler),
          getProp('description', new ConstHandler(descriptionConstHandler)),
          getProp('pokemonScale', IntHandler),
          getProp('pokemonOffset', IntHandler),
          getProp('trainerScale', IntHandler),
          getProp('trainerOffset', IntHandler),
        ],
      }),
    }),
  },
};
