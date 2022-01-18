/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint global-require: off, no-console: off, promise/always-return: off */
import { SourceFileDefinition } from 'common/file-handlers/file-handler.interface';
import 'core-js/stable';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import 'regenerator-runtime/runtime';
import { AppConfig } from '../common/config.interface';
import { IPCChannel } from '../common/ipc.interface';
import {
  formatSourceData,
  PokemonSourceData,
  PokemonSourceHandlers,
  SourceDefStruct,
  SOURCE_DEFS,
} from '../common/pokemon-source-data';
import MenuBuilder from './menu';
import { SourceFileHandler } from './source-file-handler';
import { resolveHtmlPath } from './util';

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
const store = new ElectronStore<AppConfig>();
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

function getHandler<T>(def: SourceFileDefinition<T>): SourceFileHandler<T> {
  return new SourceFileHandler(
    def,
    store.get('dpeFolder'),
    store.get('cfruFolder')
  );
}

const handlers: PokemonSourceHandlers = {} as any;

async function loadFiles() {
  if (store.get('cfruFolder') && store.get('dpeFolder')) {
    Object.entries(SOURCE_DEFS).forEach(([name, def]) => {
      handlers[name as keyof SourceDefStruct] = getHandler(def as any) as any;
    });

    const promises = Object.entries(handlers).map(async ([name, handler]) => [
      name,
      await handler.load(),
    ]);

    const rawData: PokemonSourceData = Object.fromEntries(
      await Promise.all(promises)
    );
    const data = formatSourceData(rawData);

    console.log(data);
    // Just for testing
    data.source = rawData;
    const channel: IPCChannel = 'pokemon-source-data';
    mainWindow!.webContents.send(channel, data);

    // await saveFiles(data);
  }
}

// async function saveFiles(data: AllPokemonData) {
//   const sourceData = convertToSource(data);

//   const promises = Object.entries(handlers).map(async ([name, handler]) => {
//     return handler.save(sourceData[name as keyof PokemonSourceData] as any);
//   });

//   await Promise.all(promises);
// }

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('load-files', async () => {
  await loadFiles();
});

ipcMain.on('locate-dpe', async (event) => {
  const result = dialog.showOpenDialogSync(mainWindow!, {
    properties: ['openDirectory'],
    message: 'Select DPE Location',
    title: 'Select DPE Folder',
    defaultPath: store.get('dpeFolder'),
  });
  if (result && result.length > 0) {
    store.set('dpeFolder', result[0]);
    event.reply('set-dpe-location', result[0]);
    await loadFiles();
  }
});

ipcMain.on('locate-cfru', async (event) => {
  const result = dialog.showOpenDialogSync(mainWindow!, {
    properties: ['openDirectory'],
    message: 'Select CFRU Location',
    title: 'Select CFRU Folder',
    defaultPath: store.get('cfruFolder'),
  });
  if (result && result.length > 0) {
    store.set('cfruFolder', result[0]);
    event.reply('set-cfru-location', result[0]);
    await loadFiles();
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
