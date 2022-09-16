import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';

export type PokedexOrders = {
  alphabetical: string[];
  weight: string[];
  height: string[];
};

function getPokedexOrder(type: string) {
  return new ArrayHandler<string>({
    definition: `const u16 gPokedexOrder_${type}[]`,
    itemHandler: new ConstHandler({ prefix: 'NATIONAL_DEX_' }),
  });
}

export const PokedexOrderSourceDef: SourceFileDefinition<PokedexOrders> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/pokemon/pokedex_orders.h',
    },
  ],
  schema: {
    alphabetical: getPokedexOrder('Alphabetical'),
    weight: getPokedexOrder('Weight'),
    height: getPokedexOrder('Height'),
  },
};
