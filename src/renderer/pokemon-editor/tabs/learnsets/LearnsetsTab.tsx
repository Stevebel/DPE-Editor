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
      levelUpMoves.replace([emptyLevelUpMove]);
    }

    const addMove = (e: React.MouseEvent<HTMLElement>) => {
      const index: number = parseInt(e.target.dataset.index, 10);
      const newLevelUpMoves = levelUpMoves.slice();

      newLevelUpMoves.splice(index + 1, 0, emptyLevelUpMove);
      levelUpMoves.replace(newLevelUpMoves);
    };

    const deleteMove = (e: React.MouseEvent<HTMLElement>) => {
      const index: number = parseInt(e.target.dataset.index, 10);
      const newLevelUpMoves = levelUpMoves.slice();

      newLevelUpMoves.splice(index, 1);
      levelUpMoves.replace(newLevelUpMoves);
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
