/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint global-require: off, no-console: off, promise/always-return: off */
import 'core-js/stable';
import { app, BrowserWindow, dialog, ipcMain, protocol, shell } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { existsSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import path from 'path';
import 'regenerator-runtime/runtime';
import { AppConfig } from '../common/config.interface';
import { convertToSource } from '../common/convert-to-source';
import { SourceFileDefinition } from '../common/file-handlers/file-handler.interface';
import { formatSourceData } from '../common/format-source-data';
import { wrapToWidth } from '../common/game-text';
import { IPCChannel } from '../common/ipc.interface';
import {
  HabitatLks,
  LookupData,
  LookupDefStruct,
  LookupHandlers,
  LOOKUP_DEFS,
} from '../common/lookup-values';
import { AllPokemonData } from '../common/pokemon-data.interface';
import {
  PokemonSourceData,
  PokemonSourceHandlers,
  SourceDefStruct,
  SOURCE_DEFS,
} from '../common/pokemon-source-data.interface';
import { notUndefined } from '../common/ts-utils';
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
  return new SourceFileHandler(def, store.get('srcFolder'));
}

const handlers: PokemonSourceHandlers = {} as any;
const lookupHandlers: LookupHandlers = {} as any;
let pokemonData: AllPokemonData | null = null;

async function loadFiles() {
  if (store.get('srcFolder') && mainWindow) {
    Object.entries(SOURCE_DEFS).forEach(([name, def]) => {
      handlers[name as keyof SourceDefStruct] = getHandler(def as any) as any;
    });

    const rawData: PokemonSourceData = {} as any;
    // Loop through all the handlers and load the data

    // eslint-disable-next-line no-restricted-syntax
    for (const [name, handler] of Object.entries(handlers)) {
      // eslint-disable-next-line no-await-in-loop
      rawData[name as keyof PokemonSourceData] = (await handler.load()) as any;
    }

    pokemonData = formatSourceData(rawData);
    pokemonData.source = rawData;
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

interface GoogleKeyInfo {
  email: string;
  privateKey: string;
  sheetId: string;
}

type MoveSetEntry = {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  basedOn: string;
  evs: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
  abilities: {
    ability1?: string;
    ability2?: string;
    hidden?: string;
  };
  moves: {
    move: string;
    level: number;
  }[];
};
async function loadSheet() {
  function parseGender(gender: string) {
    if (!gender) {
      return 50;
    }
    const cleanGender = gender.replace('\n', ' ').trim();
    if (cleanGender.includes('/')) {
      const parts = gender.split('/');
      return parseFloat(parts[1]);
    }
    if (cleanGender === 'Genderless') {
      return -1;
    }
    if (cleanGender === '100% Male') {
      return 0;
    }
    if (cleanGender === '100% Female') {
      return 100;
    }
    return 50;
  }
  function parseCatchRate(catchRate: string) {
    let catchRateOnly = catchRate;
    const endIndex = catchRate.indexOf('\n');
    if (endIndex >= 0) {
      catchRateOnly = catchRate.substring(0, endIndex);
    }
    return parseInt(catchRateOnly, 10);
  }
  function parseAbility(ability: string) {
    return ability?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'NONE';
  }
  function parseEggGroup(eggGroup: string) {
    return eggGroup?.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'UNDISCOVERED';
  }
  function formatHabitat(habitat: string) {
    const habitatLk = HabitatLks.find((h) => h.name === habitat);
    return habitatLk ? habitatLk.habitat : 'Urban';
  }

  const keyFileLocation = store.get('googleKeyLocation');
  if (keyFileLocation && mainWindow) {
    if (!pokemonData) {
      await loadFiles();
    }
    console.log('Loading sheet with key', keyFileLocation);
    const raw = await readFile(keyFileLocation, 'utf8');
    const key: GoogleKeyInfo = JSON.parse(raw);

    const doc = new GoogleSpreadsheet(key.sheetId);

    await doc.useServiceAccountAuth({
      client_email: key.email,
      private_key: key.privateKey,
    });

    await doc.loadInfo();

    const gartidexSheet = doc.sheetsByTitle.Gartidex;
    const moveSetSheet = doc.sheetsByTitle.Movesets;
    const dataSheet = doc.sheetsByTitle.Data;

    await gartidexSheet.loadHeaderRow(2);
    const gartidexRows = await gartidexSheet.getRows();
    const gartidexData = gartidexRows.map((row) => {
      return {
        name: row.Name.trim(),
        dexNum: parseInt(row['Dex No.'], 10),
        type1: row['Type 1'],
        type2: row['Type 2'],
        category: row.Category.trim(),
        habitat: row.Habitat,
        height: parseFloat(row['Height\nm']),
        weight: parseFloat(row['Weight\nkg']),
        movesetProgress: row['Moveset Progress'],
        eggGroup1: parseEggGroup(row['Egg Group 1']),
        eggGroup2: parseEggGroup(row['Egg Group 2']),
        gender: parseGender(row['Gender\nM/F']),
        dexEntry: row['Dex Entry'],
        catchRate: parseCatchRate(row['Catch Rate']),
        basedOn: row['Based On'],
      };
    });

    await dataSheet.loadCells('V1:W1000');
    const moveMap: Map<string, string> = new Map();
    for (let i = 1; i < 1000; i++) {
      const move = dataSheet.getCell(i, 21)?.value as string;
      if (!move) {
        break;
      }
      const moveName = dataSheet.getCell(i, 22)?.value as string;
      moveMap.set(moveName, move);
    }

    await moveSetSheet.loadHeaderRow(2);
    const moveSetRows = await moveSetSheet.getRows();
    let currentMon: any = {};
    const moveSetData: MoveSetEntry[] = [];
    moveSetRows.forEach((row) => {
      const name = row.Name?.trim();
      if (name) {
        currentMon = {
          name,
          hp: parseInt(row.HP, 10),
          attack: parseInt(row.ATK, 10),
          defense: parseInt(row.DEF, 10),
          specialAttack: parseInt(row['S.\nATK'], 10),
          specialDefense: parseInt(row['S.\nDEF'], 10),
          speed: parseInt(row.SPD, 10),
          basedOn: row.Pokemon,
          evs: {},
          abilities: {},
          moves: [],
        };
        moveSetData.push(currentMon);
      }
      if (row.Stats === 'EV Yield') {
        currentMon.evs = {
          hp: parseInt(row.HP, 10) || 0,
          attack: parseInt(row.ATK, 10) || 0,
          defense: parseInt(row.DEF, 10) || 0,
          specialAttack: parseInt(row['S.\nATK'], 10) || 0,
          specialDefense: parseInt(row['S.\nDEF'], 10) || 0,
          speed: parseInt(row.SPD, 10) || 0,
        };
      }
      const abilityType = row['Ability Type']?.trim();
      if (abilityType === 'Ability 1') {
        currentMon.abilities.ability1 = parseAbility(row.Ability);
      } else if (abilityType === 'Ability 2') {
        currentMon.abilities.ability2 = parseAbility(row.Ability);
      } else if (abilityType === 'Hidden Ability') {
        currentMon.abilities.hidden = parseAbility(row.Ability);
      }
      const learnLevel = row['Learn Level'];
      const replacement = row['Learnset Replacement'];
      if (learnLevel && replacement !== '[REMOVE]') {
        const moveName =
          replacement && replacement !== ''
            ? replacement
            : row['Base Mon Moveset'];
        currentMon.moves.push({
          move: moveMap.get(moveName) || 'NONE',
          level: learnLevel.startsWith('Evo') ? 0 : parseInt(learnLevel, 10),
        });
      }
    });

    const data = gartidexData
      .map((mon) => {
        const moveset = moveSetData.find((m) => m.name === mon.name);
        if (!moveset) {
          return null;
        }
        const nationalDexConst = mon.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_');
        return {
          basedOn: moveset.basedOn,
          nationalDex: nationalDexConst,
          regionalDexNumber: mon.dexNum,
          height: mon.height,
          weight: mon.weight,
          categoryName: mon.category,
          species: [
            {
              name: mon.name,
              nameConst: nationalDexConst,
              dexEntryConst: nationalDexConst,
              learnsetConst: nationalDexConst,
              species: mon.name,
              dexEntry: wrapToWidth(mon.dexEntry, 224) || 'TODO',
              habitat: formatHabitat(mon.habitat),
              baseStats: {
                baseHP: moveset.hp,
                baseAttack: moveset.attack,
                baseDefense: moveset.defense,
                baseSpAttack: moveset.specialAttack,
                baseSpDefense: moveset.specialDefense,
                baseSpeed: moveset.speed,
                type1: mon.type1?.toUpperCase(),
                type2: mon.type2?.toUpperCase() || mon.type1?.toUpperCase(),
                catchRate: mon.catchRate,
                evYield_HP: moveset.evs.hp,
                evYield_Attack: moveset.evs.attack,
                evYield_Defense: moveset.evs.defense,
                evYield_SpAttack: moveset.evs.specialAttack,
                evYield_SpDefense: moveset.evs.specialDefense,
                evYield_Speed: moveset.evs.speed,
                eggGroup1: mon.eggGroup1,
                eggGroup2: mon.eggGroup2,
                ability1: moveset.abilities.ability1,
                ability2: moveset.abilities.ability2,
                hiddenAbility: moveset.abilities.hidden,
              },
              learnset: moveset.moves,
              enemyElevation: 0,
              isAdditional: false,
            },
          ],
          pokemonScale: 1,
          pokemonOffset: 0,
          trainerScale: 1,
          trainerOffset: 0,
        };
      })
      .filter(notUndefined);

    mainWindow.webContents.send('spreadsheet-data', data);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveFiles(data: AllPokemonData) {
  const sourceData = convertToSource(data);

  const promises = Object.entries(handlers).map(async ([name, handler]) => {
    return handler.save(sourceData[name as keyof PokemonSourceData] as any);
  });

  // Save config.ini in sprite folders
  data.pokemon
    .filter((p) => p.regionalDexNumber)
    .forEach((p) =>
      p.species.forEach((species) => {
        const folderPath = path.join(
          store.get('assetsFolder'),
          species.nameConst.toLowerCase()
        );
        const configPath = path.join(folderPath, 'config.ini');
        // Create folder if it doesn't exist
        if (!existsSync(folderPath)) {
          // mkdirSync(folderPath);
          // // Copy sprites.png and icons.png from 'guice' folder
          // copyFileSync(
          //   path.join(store.get('assetsFolder'), 'guice', 'sprites.png'),
          //   path.join(folderPath, 'sprites.png')
          // );
          // copyFileSync(
          //   path.join(store.get('assetsFolder'), 'guice', 'icons.png'),
          //   path.join(folderPath, 'icons.png')
          // );
          return;
        }
        // Create config.ini if it doesn't exist
        const configContent =
          '[Import]\n' +
          `species=${species.speciesNumber}\n` +
          `icon_palette=${species.iconPalette}`;

        writeFileSync(configPath, configContent, { encoding: 'utf8' });
      })
    );

  await Promise.all(promises);
}

ipcMain.on('load-files', async () => {
  await loadFiles();
});

ipcMain.on('request-spreadsheet', async () => {
  await loadSheet();
});

ipcMain.on('pokemon-source-data', async (event, data: AllPokemonData) => {
  await saveFiles(data);
  event.reply('data-saved', true);
});

ipcMain.on('locate-src', async (event) => {
  const result = dialog.showOpenDialogSync(mainWindow!, {
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
  const result = dialog.showOpenDialogSync(mainWindow!, {
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
  const result = dialog.showOpenDialogSync(mainWindow!, {
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
