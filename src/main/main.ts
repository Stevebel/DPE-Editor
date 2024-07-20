/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint global-require: off, no-console: off, promise/always-return: off */
import 'core-js/stable';
import { app, BrowserWindow, dialog, ipcMain, protocol, shell } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { GoogleSpreadsheet } from 'google-spreadsheet';
// import stringify from 'json-stringify-pretty-compact';
import path from 'path';
import 'regenerator-runtime/runtime';
import { AppConfig } from '../common/config.interface';
import { SourceFileDefinition } from '../common/file-handlers/file-handler.interface';
import { wrapToWidth } from '../common/game-text';
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
  ImportedRow,
  IPokemonData,
  PokemonDataSchema,
  PokemonLearnsetSchema,
} from '../common/pokemon-data.interface';
import { notUndefined } from '../common/ts-utils';
import MenuBuilder from './menu';
import { SourceFileHandler } from './source-file-handler';
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
type TeachableEntry = {
  name: string;
  moves: string[];
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
    return ability?.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'NONE';
  }
  function parseEggGroup(eggGroup: string) {
    return eggGroup?.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'UNDISCOVERED';
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

    const gartidexSheet = doc.sheetsByTitle.Garticdex;
    const moveSetSheet = doc.sheetsByTitle.Movesets;
    const teachablesSheet = doc.sheetsByTitle.Teachables;
    const dataSheet = doc.sheetsByTitle.Data;

    await gartidexSheet.loadHeaderRow(2);
    let gartidexRows = await gartidexSheet.getRows();
    const megaIndex = gartidexRows.findIndex((row) =>
      row.Name.startsWith('Mega ')
    );
    if (megaIndex > 0) {
      gartidexRows = gartidexRows.slice(0, megaIndex);
    }
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
        dexEntry: row['Dex Entry'] || row['Old Dex Entry'] || '',
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

    const moveSetData: MoveSetEntry[] = [];
    const teachableData: TeachableEntry[] = [];

    // await moveSetSheet.loadHeaderRow(2);
    // const moveSetRows = await moveSetSheet.getRows();
    // let currentMon: any = {};
    // const moveSetData: MoveSetEntry[] = [];
    // moveSetRows.forEach((row) => {
    //   const name = row.Name?.trim();
    //   if (name) {
    //     currentMon = {
    //       name,
    //       hp: parseInt(row.HP, 10),
    //       attack: parseInt(row.ATK, 10),
    //       defense: parseInt(row.DEF, 10),
    //       specialAttack: parseInt(row['S.\nATK'], 10),
    //       specialDefense: parseInt(row['S.\nDEF'], 10),
    //       speed: parseInt(row.SPD, 10),
    //       basedOn: row.Pokemon,
    //       evs: {},
    //       abilities: {},
    //       moves: [],
    //     };
    //     moveSetData.push(currentMon);
    //   }
    //   if (row.Stats === 'EV Yield') {
    //     currentMon.evs = {
    //       hp: parseInt(row.HP, 10) || 0,
    //       attack: parseInt(row.ATK, 10) || 0,
    //       defense: parseInt(row.DEF, 10) || 0,
    //       specialAttack: parseInt(row['S.\nATK'], 10) || 0,
    //       specialDefense: parseInt(row['S.\nDEF'], 10) || 0,
    //       speed: parseInt(row.SPD, 10) || 0,
    //     };
    //   }
    //   const abilityType = row['Ability Slots']?.trim();
    //   if (abilityType === 'Ability 1') {
    //     currentMon.abilities.ability1 = parseAbility(row.Ability);
    //   } else if (abilityType === 'Ability 2') {
    //     currentMon.abilities.ability2 = parseAbility(row.Ability);
    //   } else if (abilityType === 'Hidden Ability') {
    //     currentMon.abilities.hidden = parseAbility(row.Ability);
    //   }
    //   const learnLevel = row['Learn Level'];
    //   const replacement = row['Learnset Replacement'];
    //   if (learnLevel && replacement !== '[REMOVE]') {
    //     const moveName =
    //       replacement && replacement !== ''
    //         ? replacement
    //         : row['Base Mon Moveset'];
    //     currentMon.moves.push({
    //       move: moveMap.get(moveName) || 'NONE',
    //       level: learnLevel.startsWith('Evo') ? 0 : parseInt(learnLevel, 10),
    //     });
    //   }
    // });

    // await teachablesSheet.loadHeaderRow(3);
    // const teachablesRows = await teachablesSheet.getRows();
    // const teachableMoves = teachablesSheet.headerValues.slice(3);
    // const teachableData: TeachableEntry[] = [];
    // teachablesRows.forEach((row) => {
    //   const name = row.Name?.trim();
    //   if (name) {
    //     const teachableEntry: TeachableEntry = {
    //       name,
    //       moves: [],
    //     };
    //     teachableMoves.forEach((move) => {
    //       if (
    //         row[move]?.toLowerCase() === 'x' ||
    //         row[move]?.toLowerCase() === 'a'
    //       ) {
    //         const moveConst = moveMap.get(move);
    //         if (moveConst) {
    //           teachableEntry.moves.push(moveConst);
    //         }
    //       }
    //     });
    //     teachableData.push(teachableEntry);
    //   }
    // });

    const data = gartidexData
      .map((mon) => {
        const moveset = moveSetData.find((m) => m.name === mon.name);
        const teachables = teachableData.find((t) => t.name === mon.name);
        if (!moveset) {
          return undefined;
        }
        const nationalDexConst = mon.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_');
        const out: ImportedRow = {
          name: mon.name,
          basedOn: moveset.basedOn,
          regionalDexNumber: mon.dexNum,
          nationalDexNumber: mon.dexNum,
          height: mon.height,
          weight: mon.weight,
          categoryName: mon.category,
          learnset: {
            levelUp: moveset.moves,
            teachable: teachables?.moves || [],
          },
          species: [
            {
              name: mon.name,
              species: nationalDexConst,
              baseHP: moveset.hp,
              baseAttack: moveset.attack,
              baseDefense: moveset.defense,
              baseSpAttack: moveset.specialAttack,
              baseSpDefense: moveset.specialDefense,
              baseSpeed: moveset.speed,
              types: [
                mon.type1?.toUpperCase(),
                mon.type2?.toUpperCase() || mon.type1?.toUpperCase(),
              ],
              catchRate: mon.catchRate,
              evYield_HP: moveset.evs.hp,
              evYield_Attack: moveset.evs.attack,
              evYield_Defense: moveset.evs.defense,
              evYield_SpAttack: moveset.evs.specialAttack,
              evYield_SpDefense: moveset.evs.specialDefense,
              evYield_Speed: moveset.evs.speed,
              eggGroups: [mon.eggGroup1, mon.eggGroup2],
              abilities: [
                moveset.abilities.ability1 || 'NONE',
                moveset.abilities.ability2 || 'NONE',
                moveset.abilities.hidden || 'NONE',
              ],
              enemyElevation: 0,
              exclude: false,
            },
          ],
          pokemonScale: 1,
          pokemonOffset: 0,
          trainerScale: 1,
          trainerOffset: 0,
          dexEntry: wrapToWidth(mon.dexEntry, 235)?.split('\n') || ['TODO'],
          exclude: false,
        };
        return out;
      })
      .filter(notUndefined);

    mainWindow.webContents.send('spreadsheet-data', data);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveFiles(data: AllPokemonData) {
  const srcFolder = store.get('srcFolder');

  const pokemon = data.pokemon.map((p) => PokemonDataSchema.parse(p));
  const learnsets = data.learnset.map((l) => PokemonLearnsetSchema.parse(l));

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
