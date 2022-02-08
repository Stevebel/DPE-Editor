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

    const addMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const index = Number(e.currentTarget.dataset.index);
      const level = Number(e.currentTarget.dataset.level);

      levelUpMoves.splice(index + 1, 0, { level, move: 'NONE' });
    };

    const deleteMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const index = Number(e.currentTarget.dataset.index);

      levelUpMoves.splice(index, 1);
    };

    const levelUpMoveForms = levelUpMoves.map((levelUpMove, index) => (
      <LevelUpForm
        index={index}
        levelUpMove={levelUpMove}
        addMoveHandler={addMove}
        deleteMoveHandler={deleteMove}
      />
    ));

    return <Box id="learnsets">{levelUpMoveForms}</Box>;
  }
  return null;
});
