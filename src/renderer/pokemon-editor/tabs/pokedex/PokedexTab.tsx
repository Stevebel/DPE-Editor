import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { ChangeEvent } from 'react';
import { usePokemonStoreContext } from '../../pokemon.store';

export interface PokedexTabProps {
  onNameChange?: (name: string) => void;
  onSpeciesChange?: (species: string) => void;
}

export const PokedexTab = observer(
  ({ onSpeciesChange, onNameChange }: PokedexTabProps) => {
    const pokemonStore = usePokemonStoreContext();

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!pokemonStore.selectedSpecies) {
        return;
      }
      const newName = e.target.value;
      pokemonStore.selectedSpecies.setPokemonName(newName);
      if (onNameChange) {
        onNameChange(newName);
      }
    };
    const handleSpeciesChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!pokemonStore.selectedSpecies) {
        return;
      }
      const newSpecies = e.target.value;
      pokemonStore.selectedSpecies.setSpeciesConst(newSpecies);
      if (onSpeciesChange) {
        onSpeciesChange(newSpecies);
      }
    };
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
        <TextField
          label="Pokémon Name"
          variant="standard"
          required
          value={pokemonStore.selectedSpecies?.name || ''}
          onChange={handleNameChange}
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
        <TextField
          label="Variant Constant"
          variant="standard"
          required
          disabled={!pokemonStore.selectedSpecies?.manualSpecies}
          value={pokemonStore.selectedSpecies?.species || ''}
          onChange={handleSpeciesChange}
        />
      </Grid>
    );
  }
);
