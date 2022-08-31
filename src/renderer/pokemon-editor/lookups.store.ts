import { makeAutoObservable } from 'mobx';
import React from 'react';
import { BattleMove } from '../../common/file-handlers/files/battle-moves';
import { AppIPC } from '../../common/ipc.interface';
import { LookupData } from '../../common/lookup-values';

export type MoveLk = BattleMove & {
  name: string;
};

export type TMDef = {
  num: number;
  move: string;
};

export class LookupStore {
  moves: MoveLk[] = [];

  tms: TMDef[] = [];

  constructor(ipc: AppIPC) {
    makeAutoObservable(this);

    ipc.on('lookup-values', (data) => {
      this.populateMoves(data);
    });
  }

  populateMoves(data: LookupData) {
    const { attackNames } = data.attackNameTable;
    const battleMoves = data.battleMoves.moves;

    this.moves = attackNames.map((attackName, i) => {
      const move = battleMoves[i];
      return {
        ...move,
        name: attackName.name,
      };
    });

    this.tms = data.tmTable.tmMoves.map((move, i) => {
      return {
        num: i + 1,
        move,
      };
    });
    console.log(this.tms);
  }
}

export const LookupsStoreContext = React.createContext(
  new LookupStore(window.electron.ipcRenderer)
);
export const useLookupStoreContext = () =>
  React.useContext(LookupsStoreContext);
