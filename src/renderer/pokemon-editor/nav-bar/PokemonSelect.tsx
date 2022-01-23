import { observer } from 'mobx-react-lite';
import Typeahead from '../../common/Typeahead';
import { PokemonData, usePokemonStoreContext } from '../pokemon.store';

type SelectOption = {
  label: string;
  value: string;
};

// eslint-disable-next-line import/prefer-default-export
export const PokemonSelect = observer(() => {
  const pokemonStore = usePokemonStoreContext();

  function toOption(p: PokemonData): SelectOption {
    return {
      label: p.species[0]?.name,
      value: p.id,
    };
  }

  function getOptions() {
    console.log('Get options');
    return pokemonStore.pokemon
      .filter((p) => p.nationalDexNumber > 0)
      .map(toOption);
  }

  function getSelectedOption() {
    const selected = pokemonStore.selectedPokemon;
    return selected ? toOption(selected) : null;
  }

  function handleSelect(option: SelectOption) {
    pokemonStore.setSelectedPokemon(option?.value);
  }

  return (
    <Typeahead
      label="Pokémon"
      options={getOptions()}
      value={getSelectedOption()}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      onChange={(_, option) => handleSelect(option as SelectOption)}
    />
  );
});
