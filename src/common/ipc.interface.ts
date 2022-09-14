import { LookupData } from './lookup-values';
import { AllPokemonData, ImportedRow } from './pokemon-data.interface';

export type IPCConfigs = {
  'locate-src': () => void;
  'set-src-location': () => string;
  'locate-assets': () => void;
  'set-assets-location': () => string;
  'locate-google-key': () => void;
  'set-google-key-location': () => string;
  'load-files': () => void;
  'pokemon-source-data': (data: AllPokemonData) => AllPokemonData;
  'data-saved': () => boolean;
  'lookup-values': () => LookupData;
  'request-spreadsheet': () => void;
  'spreadsheet-data': () => ImportedRow[][];
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
