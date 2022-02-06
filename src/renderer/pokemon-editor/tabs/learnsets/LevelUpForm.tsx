import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableDropdownField } from '../../../common/forms/ObservableDropdownField';
import { usePokemonStoreContext } from '../../pokemon.store';

export interface LevelUpFormProps {
  level: number | null;
  move: string;
  addMoveHandler: () => void;
}

export function LevelUpForm(props: LevelUpFormProps) {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const { level, move, addMoveHandler } = props;

  if (species) {
    return (
      <Box className="common-form">
        <ObservableNumberField
          label={`Level ${level}`}
          store={species}
          path={['baseStats', 'baseHP']}
        />
        <ObservableDropdownField
          label={`Move: ${move}`}
          store={species}
          path={['spriteConst']}
          setter="setSpriteConst"
          options={[
            { value: 'MOVE_BABYDOLLEYES', label: 'BABYDOLLEYES' },
            { value: 'MOVE_TACKLE', label: 'TACKLE' },
          ]}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addMoveHandler}
        >
          Add Move
        </Button>
      </Box>
    );
  }
  return null;
}
