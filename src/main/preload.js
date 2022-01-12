/* eslint-disable @typescript-eslint/no-var-requires */
const { contextBridge, ipcRenderer } = require('electron');
const ElectronStore = require('electron-store');

const store = new ElectronStore();

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: ipcRenderer.send,
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once(channel, func) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
  },
  store: {
    get(key) {
      return store.get(key);
    },
    set(key, value) {
      store.set(key, value);
    },
  },
});
