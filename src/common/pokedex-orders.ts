import { sortBy } from 'lodash';
import { PokedexOrders } from './file-handlers/files/pokedex-order';
import { MAX_TYPE_ORDER, TypeOrder } from './lookup-values';
import { AllPokemonData, PokemonData } from './pokemon-data.interface';

function getPokedexOrder(
  pokemon: PokemonData[],
  sortFn: (p: PokemonData) => string | number | undefined
): string[] {
  const sorted = sortBy(
    pokemon.filter((p) => sortFn(p) !== undefined),
    sortFn
  );
  const order = sorted.map((p) => p.species[0].species);
  return order;
}

function getTypeOrder(type: string) {
  return type ? TypeOrder[type] : -1;
}

// eslint-disable-next-line import/prefer-default-export
export function getPokedexOrders(data: AllPokemonData): PokedexOrders {
  const pokemon = data.pokemon.slice(0, data.lastNationalDex + 1);
  return {
    regional: getPokedexOrder(pokemon, (p) => p.regionalDexNumber),
    alphabetical: getPokedexOrder(pokemon, (p) => p.species[0].name),
    weight: getPokedexOrder(pokemon, (p) => p.weight),
    height: getPokedexOrder(pokemon, (p) => p.height),
    type: getPokedexOrder(
      pokemon,
      (p) =>
        getTypeOrder(p.species[0].baseStats.type1) * MAX_TYPE_ORDER +
        getTypeOrder(p.species[0].baseStats.type2)
    ),
  };
}
