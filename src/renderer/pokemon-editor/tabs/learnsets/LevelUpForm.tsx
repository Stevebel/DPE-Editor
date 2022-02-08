import { Box, Button } from '@mui/material';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { usePokemonStoreContext } from '../../pokemon.store';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { LevelUpMove } from '../../../../common/file-handlers/files/learnsets';

export interface LevelUpFormProps {
  index: number;
  levelUpMove: LevelUpMove;
  addMoveHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deleteMoveHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function LevelUpForm(props: LevelUpFormProps) {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const { index, levelUpMove, addMoveHandler, deleteMoveHandler } = props;

  if (species) {
    return (
      <>
        <Box className="common-form">
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            data-index={index}
            data-level={levelUpMove.level}
            color="success"
            onClick={addMoveHandler}
          />
          <Button
            variant="contained"
            startIcon={<RemoveIcon />}
            data-index={index}
            onClick={deleteMoveHandler}
            color="error"
          />
        </Box>
      </>
    );
  }
  return null;
}
