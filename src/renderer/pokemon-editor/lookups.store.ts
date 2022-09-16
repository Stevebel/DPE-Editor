import { makeAutoObservable } from 'mobx';
import React from 'react';
import { BattleMove } from '../../common/file-handlers/files/battle-moves';
import { AppIPC } from '../../common/ipc.interface';
import { LookupData } from '../../common/lookup-values';

export type MoveLk = BattleMove & {
  name: string;
};

export class LookupStore {
  moves: MoveLk[] = [];

  constructor(ipc: AppIPC) {
    makeAutoObservable(this);

    ipc.on('lookup-values', (data) => {
      this.populateMoves(data);
    });
  }

  populateMoves(data: LookupData) {
    const { longAttackNames: attackNames } = data.attackNameTable;
    const battleMoves = data.battleMoves.moves;
    console.log('Attack names', data.attackNameTable);

    this.moves = attackNames.map((attackName, i) => {
      const move = battleMoves[i];
      return {
        ...move,
        name: attackName.name,
      };
    });
  }
}

export const LookupsStoreContext = React.createContext(
  new LookupStore(window.electron.ipcRenderer)
);
export const useLookupStoreContext = () =>
  React.useContext(LookupsStoreContext);
