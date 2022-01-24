import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import Typeahead from '../../common/Typeahead';
import { SPECIES_LABEL } from '../../consts';
import { PokemonSpeciesData, usePokemonStoreContext } from '../pokemon.store';

type SelectOption = {
  label: string;
  value: string;
};

// eslint-disable-next-line import/prefer-default-export
export const SpeciesSelect = observer(() => {
  const pokemonStore = usePokemonStoreContext();

  function toOption(s: PokemonSpeciesData): SelectOption {
    return {
      label: s.species,
      value: s.id,
    };
  }

  function getOptions() {
    return (pokemonStore.availableSpecies || []).map(toOption);
  }

  function getSelectedOption() {
    const selected = pokemonStore.selectedSpecies;
    return selected ? toOption(selected) : null;
  }

  function handleSelect(option: SelectOption) {
    runInAction(() => {
      pokemonStore.selectedSpeciesId = option?.value;
    });
  }

  return (
    <Typeahead
      options={getOptions()}
      value={getSelectedOption()}
      label={SPECIES_LABEL}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      onChange={(_, option) => handleSelect(option as SelectOption)}
    />
  );
});
