import { Box } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { usePokemonStoreContext } from '../../pokemon.store';
import { LevelUpMoveForm } from './LevelUpMoveForm';

export const LearnsetsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;

  if (species) {
    const levelUpMoves = species.learnset;
    const emptyLevelUpMove = { level: 0, move: 'NONE' };

    if (levelUpMoves.length === 0) {
      runInAction(() => {
        levelUpMoves.push({
          ...emptyLevelUpMove,
          id: uuid(),
        });
      });
    }

    const levelUpMoveIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
      return Number(e.currentTarget.dataset.index);
    };

    const addMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const { level } = levelUpMoves[levelUpMoveIndex(e)];

      runInAction(() => {
        levelUpMoves.splice(levelUpMoveIndex(e) + 1, 0, {
          level,
          move: 'NONE',
          id: uuid(),
        });
      });
    };

    const deleteMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      runInAction(() => {
        levelUpMoves.splice(levelUpMoveIndex(e), 1);
      });
    };

    const levelUpMoveForms = levelUpMoves.map((levelUpMove, index) => (
      <LevelUpMoveForm
        key={levelUpMove.id}
        index={index}
        addMoveHandler={addMove}
        deleteMoveHandler={deleteMove}
      />
    ));

    return <Box id="learnsets">{levelUpMoveForms}</Box>;
  }
  return null;
});
