import ElectronStore from 'electron-store';

import { AppConfig } from '../common/config.interface';
import { AppIPC } from '../common/ipc.interface';

export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: AppIPC;
      store: {
        get: ElectronStore<AppConfig>['get'];
        set: ElectronStore<AppConfig>['set'];
      };
    };
  }
}
