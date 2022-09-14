import { SourceFileDefinition } from '../file-handler.interface';
import { ConstDefinitionHandler } from '../handlers/const-definitions-handler';
import { messageHandler } from '../handlers/message-handler';
import { getProp } from '../handlers/struct-handler';

export interface PokedexText {
  pokedexData: PokedexTextEntry[];
}
export interface PokedexTextEntry {
  dexEntryConst: string;
  dexEntry: string;
}

export const PokedexTextSourceDef: SourceFileDefinition<PokedexText> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/pokemon/pokedex_text.h',
    },
  ],
  schema: {
    pokedexData: new ConstDefinitionHandler<PokedexTextEntry>({
      indexProperty: 'dexEntryConst',
      definitionPrefix: 'const u8 g',
      definitionSuffix: 'PokedexText[]',
      propHandler: getProp('dexEntry', messageHandler()),
    }),
  },
};
