import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { usePokemonStoreContext } from '../../pokemon.store';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';

export interface LevelUpFormProps {
  index: number;
  addMoveHandler: (e: React.MouseEvent<HTMLElement>) => void;
  deleteMoveHandler: (e: React.MouseEvent<HTMLElement>) => void;
}

export function LevelUpForm(props: LevelUpFormProps) {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const { index, addMoveHandler, deleteMoveHandler } = props;

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
            onClick={addMoveHandler}
            color="success"
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
