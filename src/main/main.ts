/* eslint-disable @typescript-eslint/no-var-requires */
import 'core-js/stable';
import { app, BrowserWindow, dialog, ipcMain, protocol, shell } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import 'regenerator-runtime/runtime';
import { AppConfig } from '../common/config.interface';
import { SourceFileDefinition } from '../common/file-handlers/file-handler.interface';
import { IPCChannel } from '../common/ipc.interface';
import {
  LOOKUP_DEFS,
  LookupData,
  LookupDefStruct,
  LookupHandlers,
} from '../common/lookup-values';
import {
  AllPokemonData,
  ILearnset,
  IPokemonData,
  PokemonDataSchema,
  PokemonLearnsetSchema
} from '../common/pokemon-data.interface';
import MenuBuilder from './menu';
import { SourceFileHandler } from './source-file-handler';
import { loadSheet } from './spreadsheet';
import { resolveHtmlPath } from './util';

const stringify = require('json-stringify-pretty-compact');

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
  return new SourceFileHandler(def, store.get('srcFolder'));
}

const lookupHandlers: LookupHandlers = {} as any;
let pokemonData: AllPokemonData | null = null;

async function loadFiles() {
  if (store.get('srcFolder') && mainWindow) {
    const srcFolder = store.get('srcFolder');

    const pokemonJsonPath = path.join(
      srcFolder,
      'src',
      'data',
      'pokemon',
      'pokemon.json'
    );
    const rawPokemonJson = await readFile(pokemonJsonPath, 'utf8');
    const pokemonJson: { pokemon: IPokemonData[] } = JSON.parse(rawPokemonJson);

    const learnsetJsonPath = path.join(
      srcFolder,
      'src',
      'data',
      'pokemon',
      'learnsets.json'
    );
    const rawLearnsetJson = await readFile(learnsetJsonPath, 'utf8');
    const learnsetJson: { learnsets: ILearnset[] } =
      JSON.parse(rawLearnsetJson);

    pokemonData = {
      pokemon: pokemonJson.pokemon,
      learnset: learnsetJson.learnsets,
    };
    let channel: IPCChannel = 'pokemon-source-data';
    mainWindow.webContents.send(channel, pokemonData);

    Object.entries(LOOKUP_DEFS).forEach(([name, def]) => {
      lookupHandlers[name as keyof LookupDefStruct] = getHandler(
        def as any
      ) as any;
    });
    const lookupPromises = Object.entries(lookupHandlers).map(
      async ([name, handler]) => [name, await handler.load()]
    );

    const lookups: LookupData = Object.fromEntries(
      await Promise.all(lookupPromises)
    );

    channel = 'lookup-values';
    mainWindow.webContents.send(channel, lookups);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveFiles(data: AllPokemonData) {
  const srcFolder = store.get('srcFolder');
  let failed = false;
  const pokemon = data.pokemon.map((p) => {
    try {
      return PokemonDataSchema.parse(p);
    } catch (e) {
      console.error('Mon data error', p.name,e);
      failed = true;
      return null;
    }
  });
  const learnsets = data.learnset.map((l) => {
    try {
      const parsed = PokemonLearnsetSchema.parse(l);
      parsed.exclude = parsed.exclude === true;
      return parsed;
    } catch (e) {
      console.error('Learnset error', l.species,e);
      failed = true;
      return null;
    }
  });
  if (failed) {
    return;
  }
  const pokemonJsonPath = path.join(
    srcFolder,
    'src',
    'data',
    'pokemon',
    'pokemon.json'
  );

  writeFileSync(pokemonJsonPath, stringify({ pokemon }), {
    encoding: 'utf8',
  });

  const learnsetJsonPath = path.join(
    srcFolder,
    'src',
    'data',
    'pokemon',
    'learnsets.json'
  );

  writeFileSync(learnsetJsonPath, stringify({ learnsets }), {
    encoding: 'utf8',
  });

  // Save config.ini in sprite folders
  data.pokemon
    .filter((p) => p.regionalDexNumber)
    .forEach((p) =>
      p.species.forEach((species) => {
        const folderPath = path.join(
          store.get('assetsFolder'),
          species.graphicsFolder
        );
        // const configPath = path.join(folderPath, 'config.ini');
        // Create folder if it doesn't exist
        if (!existsSync(folderPath)) {
          mkdirSync(folderPath);
          // Copy sprites.png and icons.png from 'guice' folder
          copyFileSync(
            path.join(store.get('assetsFolder'), 'guice', 'sprites.png'),
            path.join(folderPath, 'sprites.png')
          );
          copyFileSync(
            path.join(store.get('assetsFolder'), 'guice', 'icons.png'),
            path.join(folderPath, 'icons.png')
          );
        }
        // Delete config.ini
        // unlinkSync(configPath);
      })
    );
}

ipcMain.on('load-files', async () => {
  await loadFiles();
});

ipcMain.on('request-spreadsheet', async () => {
  if (!mainWindow) {
    return;
  }
  if (!pokemonData) {
    await loadFiles();
  }
  const keyFileLocation = store.get('googleKeyLocation');
  const data = await loadSheet(keyFileLocation);
  mainWindow.webContents.send('spreadsheet-data', data);
});

ipcMain.on('pokemon-source-data', async (event, data: AllPokemonData) => {
  await saveFiles(data);
  event.reply('data-saved', true);
});

ipcMain.on('locate-src', async (event) => {
  if (!mainWindow) {
    return;
  }
  const result = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openDirectory'],
    message: 'Select Pokeemerald Source Location',
    title: 'Select Source Folder',
    defaultPath: store.get('srcFolder'),
  });
  if (result && result.length > 0) {
    store.set('srcFolder', result[0]);
    event.reply('set-src-location', result[0]);
    await loadFiles();
  }
});

ipcMain.on('locate-assets', async (event) => {
  if (!mainWindow) {
    return;
  }
  const result = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openDirectory'],
    message: 'Select Assets Location',
    title: 'Select Assets Folder',
    defaultPath: store.get('assetsFolder'),
  });
  if (result && result.length > 0) {
    store.set('assetsFolder', result[0]);
    event.reply('set-assets-location', result[0]);
    await loadFiles();
  }
});

ipcMain.on('locate-google-key', async (event) => {
  if (!mainWindow) {
    return;
  }
  const result = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openFile'],
    message: 'Select Google API Key File',
    title: 'Select Google API Key File',
    defaultPath: store.get('googleKeyLocation'),
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (result && result.length > 0) {
    store.set('googleKeyLocation', result[0]);
    event.reply('set-google-key-file', result[0]);
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

  protocol.registerFileProtocol('asset', (request, callback) => {
    const relativePath = request.url.replace('asset://', '');
    const absolutePath = path.join(store.get('assetsFolder'), relativePath);
    callback(absolutePath);
  });

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
