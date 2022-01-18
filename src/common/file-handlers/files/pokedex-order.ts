import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';

export type PokedexOrders = {
  regional: string[];
  alphabetical: string[];
  weight: string[];
  height: string[];
  type: string[];
};

function getPokedexOrder(type: string) {
  return new ArrayHandler<string>({
    definition: `const u16 gPokedexOrder_${type}[]`,
    itemHandler: new ConstHandler({ prefix: 'SPECIES_' }),
  });
}

export const PokedexOrderSourceDef: SourceFileDefinition<PokedexOrders> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Pokedex_Orders.c',
    },
  ],
  schema: {
    regional: getPokedexOrder('Regional'),
    alphabetical: getPokedexOrder('Alphabetical'),
    weight: getPokedexOrder('Weight'),
    height: getPokedexOrder('Height'),
    type: getPokedexOrder('Type'),
  },
};
