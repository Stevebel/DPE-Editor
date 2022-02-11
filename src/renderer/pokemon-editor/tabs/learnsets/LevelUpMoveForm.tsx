import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, IconButton } from '@mui/material';
import React from 'react';
import { MoveDropdown } from '../../../common/forms/MoveDropdown';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { usePokemonStoreContext } from '../../pokemon.store';

export interface LevelUpFormProps {
  index: number;
  addMoveHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deleteMoveHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function LevelUpMoveForm(props: LevelUpFormProps) {
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
          <MoveDropdown
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
            <IconButton
              data-index={index}
              color="primary"
              onClick={addMoveHandler}
              title="Add new move"
            >
              <AddIcon />
            </IconButton>
            <IconButton
              data-index={index}
              onClick={deleteMoveHandler}
              color="error"
              title="Remove this move"
            >
              <RemoveIcon />
            </IconButton>
          </Box>
        </Box>
      </>
    );
  }
  return null;
}
