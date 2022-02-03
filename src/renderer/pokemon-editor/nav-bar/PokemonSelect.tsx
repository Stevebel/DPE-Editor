import { observer } from 'mobx-react-lite';
import Typeahead, { SelectOption } from '../../common/Typeahead';
import { PokemonData, usePokemonStoreContext } from '../pokemon.store';

// eslint-disable-next-line import/prefer-default-export
export const PokemonSelect = observer(() => {
  const pokemonStore = usePokemonStoreContext();

  function toOption(p: PokemonData): SelectOption {
    const s = p.species[0] || {};
    return {
      label: `#${p.nationalDexNumber} - ${s.name}`,
      value: p.id,
    };
  }

  function getOptions() {
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
