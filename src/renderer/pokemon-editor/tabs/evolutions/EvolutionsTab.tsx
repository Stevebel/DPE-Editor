import { Box, Button } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { Evolution } from '../../../../common/file-handlers/files/evolution-table';
import { usePokemonStoreContext } from '../../pokemon.store';
import { EvolutionForm } from './EvolutionForm';

export const EvolutionsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;

  if (species) {
    let { evolutions } = species;
    const emptyEvolution: Evolution = {
      method: 'LEVEL',
      targetSpecies: 'NONE',
      param: 1,
      extra: 0,
    };

    const evoIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
      return Number(e.currentTarget.dataset?.index || 0);
    };

    const addEvolution = (e: React.MouseEvent<HTMLButtonElement>) => {
      runInAction(() => {
        const index = evoIndex(e);
        const newEntry = {
          ...emptyEvolution,
          id: uuid(),
        };
        if (index >= evolutions.length) {
          evolutions = [...evolutions, newEntry];
        } else {
          evolutions = [...evolutions];
          evolutions.splice(index + 1, 0, newEntry);
        }
        species.evolutions = evolutions;
      });
    };

    const deleteEvolution = (e: React.MouseEvent<HTMLButtonElement>) => {
      runInAction(() => {
        const index = evoIndex(e);
        evolutions = evolutions.filter((_, i) => i !== index);
        species.evolutions = evolutions;
      });
    };

    const evolutionForms = evolutions?.map((levelUpMove, index) => (
      <EvolutionForm
        key={levelUpMove.id}
        index={index}
        addEvolutionHandler={addEvolution}
        deleteEvolutionHandler={deleteEvolution}
      />
    ));

    return (
      <Box id="evolutions">
        {evolutionForms}
        {evolutionForms?.length === 0 && (
          <Button onClick={addEvolution} variant="contained" color="primary">
            Add Evolution
          </Button>
        )}
      </Box>
    );
  }
  return null;
});
