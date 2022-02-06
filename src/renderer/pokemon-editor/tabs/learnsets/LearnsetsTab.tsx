import React from 'react';
import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { usePokemonStoreContext } from '../../pokemon.store';
import { LevelUpForm } from './LevelUpForm';

export const LearnsetsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const initialState = [{ level: 1, move: 'Test' }];

  type LevelUpMove = {
    level: number | null;
    move: string;
  };

  const [levelUpMoves, setLevelUpMoves] =
    React.useState<LevelUpMove[]>(initialState);

  const addMove = () => {
    setLevelUpMoves([...levelUpMoves, { move: '', level: null }]);
  };

  if (species) {
    const levelUpMoveForms = levelUpMoves.map((levelUpMove) => (
      <LevelUpForm
        move={levelUpMove.move}
        level={levelUpMove.level}
        addMoveHandler={addMove}
      />
    ));

    return <Box id="learnsets">{levelUpMoveForms}</Box>;
  }
  return null;
});
