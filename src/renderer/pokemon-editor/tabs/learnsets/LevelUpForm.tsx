import { Box, Button } from '@mui/material';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { usePokemonStoreContext } from '../../pokemon.store';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';

export interface LevelUpFormProps {
  index: number;
  addMoveHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deleteMoveHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function LevelUpForm(props: LevelUpFormProps) {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const { index, addMoveHandler, deleteMoveHandler } = props;

  if (species) {
    return (
      <>
        <Box
          className="common-form"
          sx={{
            maxWidth: 700,
            '&:hover': {
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <ObservableNumberField
            label="Level"
            store={species}
            path={['learnset', index, 'level']}
          />
          <ObservableTextField
            label="Move"
            store={species}
            path={['learnset', index, 'move']}
          />
          <Box
            sx={{
              button: {
                marginRight: 1,
                marginTop: 1,
              },
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              data-index={index}
              color="primary"
              onClick={addMoveHandler}
            >
              Add
            </Button>
            <Button
              variant="contained"
              startIcon={<RemoveIcon />}
              data-index={index}
              onClick={deleteMoveHandler}
              color="error"
            >
              Remove
            </Button>
          </Box>
        </Box>
      </>
    );
  }
  return null;
}
