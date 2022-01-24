import { FormControlLabel, Grid, Switch } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { ChangeEvent } from 'react';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { usePokemonStoreContext } from '../../pokemon.store';

export const PokedexTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies!;

  const handleSpeciesOverrideChange = (e: ChangeEvent<HTMLInputElement>) => {
    runInAction(() => {
      if (!pokemonStore.selectedSpecies) {
        return;
      }
      const newSpeciesOverride = e.target.checked;

      pokemonStore.selectedSpecies.manualSpecies = newSpeciesOverride;
    });
  };

  return (
    <Grid id="pokedex">
      <ObservableTextField
        store={species}
        path={['name']}
        setter="setPokemonName"
      />
      <FormControlLabel
        control={
          <Switch
            checked={pokemonStore.selectedSpecies?.manualSpecies || false}
            onChange={handleSpeciesOverrideChange}
          />
        }
        label="Override Constant"
      />
      <ObservableTextField
        store={species}
        path={['species']}
        setter="setSpeciesConst"
        disabled={!pokemonStore.selectedSpecies?.manualSpecies || false}
      />
    </Grid>
  );
});
