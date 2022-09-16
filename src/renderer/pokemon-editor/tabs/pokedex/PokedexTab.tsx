import { Box, InputAdornment } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { HabitatLks } from '../../../../common/lookup-values';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableSwitch } from '../../../common/forms/ObservableSwitch';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { SPECIES_LABEL } from '../../../consts';
import { usePokemonStoreContext } from '../../pokemon.store';

export const PokedexTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const pokemon = pokemonStore.selectedPokemon;
  const species = pokemonStore.selectedSpecies;
  const habitats = HabitatLks.map((h) => ({ label: h.name, value: h.habitat }));
  if (pokemon && species) {
    return (
      <Box id="pokedex" className="common-form">
        <ObservableTextField
          label="Pokémon Name"
          store={species}
          path={['name']}
          setter="setPokemonName"
        />
        <ObservableSwitch
          label="Override Constant"
          store={species}
          path={['manualSpecies']}
        />
        <ObservableTextField
          label={`${SPECIES_LABEL} Constant`}
          store={species}
          path={['species']}
          setter="setSpeciesConst"
          disabled={!pokemonStore.selectedSpecies?.manualSpecies || false}
        />
        <ObservableTextField
          label="Category"
          store={pokemon}
          path={['categoryName']}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">Pokémon</InputAdornment>
            ),
          }}
        />
        <ObservableNumberField
          label="Height"
          store={pokemon}
          path={['height']}
          InputProps={{
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
        />
        <ObservableNumberField
          label="Weight"
          store={pokemon}
          path={['weight']}
          InputProps={{
            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
          }}
        />
        <ObservableTextField
          className="full-line"
          label="Pokédex Entry"
          store={species}
          path={['dexEntry']}
          setter="setDexEntry"
          multiline
          rows={4}
          InputProps={{
            className: 'dex-entry',
          }}
        />
      </Box>
    );
  }
  return null;
});
