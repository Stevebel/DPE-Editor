import React from 'react';
import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { usePokemonStoreContext } from '../../pokemon.store';
import { LevelUpForm } from './LevelUpForm';

export const LearnsetsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;

  if (species) {
    const levelUpMoves = species.learnset;
    const emptyLevelUpMove = { level: 0, move: 'NONE' };

    if (levelUpMoves.length === 0) {
      levelUpMoves.push(emptyLevelUpMove);
    }

    const levelUpMoveIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
      return Number(e.currentTarget.dataset.index);
    };

    const addMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const { level } = levelUpMoves[levelUpMoveIndex(e)];

      levelUpMoves.splice(levelUpMoveIndex(e) + 1, 0, { level, move: 'NONE' });
    };

    const deleteMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      levelUpMoves.splice(levelUpMoveIndex(e), 1);
    };

    const levelUpMoveForms = levelUpMoves.map((_levelUpMove, index) => (
      <LevelUpForm
        index={index}
        addMoveHandler={addMove}
        deleteMoveHandler={deleteMove}
      />
    ));

    return <Box id="learnsets">{levelUpMoveForms}</Box>;
  }
  return null;
});
