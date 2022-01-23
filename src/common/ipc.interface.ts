import { AllPokemonData } from './pokemon-data.interface';

export type IPCConfigs = {
  'locate-dpe': () => void;
  'set-dpe-location': () => string;
  'locate-cfru': () => void;
  'set-cfru-location': () => string;
  'load-files': () => void;
  'pokemon-source-data': (data: AllPokemonData) => AllPokemonData;
};

export type IPCChannel = keyof IPCConfigs;
export type IPCSends<K extends IPCChannel> = ReturnType<
  IPCConfigs[K]
> extends Array<any>
  ? ReturnType<IPCConfigs[K]>
  : [ReturnType<IPCConfigs[K]>];

export type AppIPC = {
  send: <K extends IPCChannel>(
    channel: K,
    ...args: Parameters<IPCConfigs[K]>
  ) => void;
  on: <K extends IPCChannel>(
    channel: K,
    func: (...args: IPCSends<K>) => void
  ) => () => void;
  once: (channel: IPCChannel, func: (...args: any[]) => void) => void;
};
