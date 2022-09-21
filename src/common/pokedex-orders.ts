import { sortBy } from 'lodash';
import { PokedexOrders } from './file-handlers/files/pokedex-order';
import { TypeOrder } from './lookup-values';
import { AllPokemonData, IPokemonData } from './pokemon-data.interface';

function getPokedexOrder(
  pokemon: IPokemonData[],
  sortFn: (p: IPokemonData) => string | number | undefined
): string[] {
  const sorted = sortBy(
    pokemon.filter((p) => sortFn(p) !== undefined),
    sortFn
  );
  const order = sorted.map((p) => p.species[0].species);
  return order;
}

function getTypeOrder(type: string | undefined) {
  return type ? TypeOrder[type] : -1;
}

// eslint-disable-next-line import/prefer-default-export
export function getPokedexOrders(data: AllPokemonData): PokedexOrders {
  const pokemon = data.pokemon.slice().filter((p) => p.nationalDexNumber > 0);
  return {
    alphabetical: getPokedexOrder(pokemon, (p) => p.species[0].name),
    weight: getPokedexOrder(pokemon, (p) => p.weight),
    height: getPokedexOrder(pokemon, (p) => p.height),
  };
}
