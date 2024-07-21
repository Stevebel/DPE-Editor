import { readFile } from 'fs/promises';
import { JWT } from 'google-auth-library';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { isNumber, isString } from 'lodash';
import { LevelUpMove } from '../common/file-handlers/files/level-up-learnsets';
import { normalizeText } from '../common/game-text';
import { ImportedRow, IPokemonSpeciesData, PokemonType } from '../common/pokemon-data.interface';
import { notUndefined } from '../common/ts-utils';

interface GoogleKeyInfo {
  email: string;
  privateKey: string;
  sheetId: string;
}

type SheetTitle =
  | 'BattleBackgrounds'
  | 'Bot Info'
  | 'Character Sheets'
  | 'Credits'
  | 'Data'
  | 'Egg Groups'
  | 'Garticdex'
  | 'Garticmon Cookbook'
  | 'Garticmon Data'
  | 'Garticmon Encounters'
  | 'Interiors'
  | 'Item Dex'
  | 'Item Locations'
  | 'Location Previews'
  | 'Megas'
  | 'Movesets (Outdated)'
  | 'Music'
  | 'PC Box Wallpapers & Text Frames'
  | 'Region Maps'
  | 'Reveals'
  | 'Sprites 1'
  | 'Sprites 2'
  | 'Sprites 3'
  | 'Sprites 4'
  | 'Sprites 5'
  | 'TM Info'
  | 'Teachables (Outdated)'
  | 'Teams'
  | 'Trainer Battles'
  | 'Trainer Battles (Hard Mode)'
  | 'Trainer Battles Images'
  | 'Trainer/NPCs Sprites'
  | 'Type Combos';

function getSheet(doc: GoogleSpreadsheet, title: SheetTitle) {
  return doc.sheetsByTitle[title];
}

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
  const abilityName = ability?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if (abilityName.length === 0 || abilityName === '_') {
    return 'NONE';
  }
  return abilityName;
}
function parseEggGroup(eggGroup: string) {
  return eggGroup?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_') || 'UNDISCOVERED';
}

async function getGarticmonRowGroups(
  garticmonSheet: GoogleSpreadsheetWorksheet
) {
  const batchSize = 2500;
  let lastRow = 0;
  let monRows: (string | number)[][] = [];
  const groupedRows: (string | number)[][][] = [];
  let inHeader = true;
  while (lastRow < garticmonSheet.rowCount) {
    const endRow = Math.min(lastRow + batchSize, garticmonSheet.rowCount);
    // eslint-disable-next-line no-await-in-loop
    await garticmonSheet.loadCells({
      startRowIndex: lastRow,
      endRowIndex: endRow,
      startColumnIndex: 0,
      endColumnIndex: garticmonSheet.columnCount,
    });
    for (let i = lastRow; i < endRow; i++) {
      const row = [];
      for (let j = 0; j < garticmonSheet.columnCount; j++) {
        const cell = garticmonSheet.getCell(i, j);
        row.push(cell?.value as string | number);
      }
      if (row[1] === 'Data:') {
        const headerRow = monRows.pop();
        if (inHeader) {
          inHeader = false;
        } else {
          groupedRows.push(monRows);
        }
        if (headerRow) {
          monRows = [headerRow];
        }
      }
      monRows.push(row);
    }
    lastRow = endRow;
  }
  if (monRows.length > 0) {
    groupedRows.push(monRows);
  }
  return groupedRows;
}

function getStats(dataRows: (string | number)[][]) {
  const baseStats: Partial<IPokemonSpeciesData> = {};
  let currSection: 'typing' | 'stats' | 'abilities' | 'evs' | 'eggGroups' | null = null;
  for (let i = 0; i < dataRows.length; i++) {
    const [_, cell1, cell2] = dataRows[i];
    let sectionChanged = true;
    switch (cell1) {
      case 'Typing':
        currSection = 'typing';
        break;
      case 'Stats':
        currSection = 'stats';
        break;
      case 'Abilities':
        currSection = 'abilities';
        break;
      case 'EV Yield':
        currSection = 'evs';
        break;
      case 'Egg Groups:':
        currSection = 'eggGroups';
        break;
      default:
        sectionChanged = false;
        break;
    }
    if (sectionChanged) {
      continue;
    }
    switch (currSection) {
      case null:
        break;
      case 'typing':
        const type = isString(cell2)
          ? cell2.toUpperCase() as PokemonType : null;
        if (!type) {
          break;
        }
        if (!baseStats.types) {
          baseStats.types = [];
        }
        if (cell1 === 1) {
          baseStats.types = [type, type];
        } else if (cell1 === 2) {
          baseStats.types[1] = type;
        }
        break;
      case 'stats':
        if (!isNumber(cell2)) {
          break;
        }
        switch (cell1) {
          case 'HP':
            baseStats.baseHP = cell2;
            break;
          case 'Atk.':
            baseStats.baseAttack = cell2;
            break;
          case 'Def.':
            baseStats.baseDefense = cell2;
            break;
          case 'S.Atk':
            baseStats.baseSpAttack = cell2;
            break;
          case 'S.Def':
            baseStats.baseSpDefense = cell2;
            break;
          case 'Spd.':
            baseStats.baseSpeed = cell2;
            break;
          default:
            break;
        }
        break;
      case 'abilities':
        const ability = isString(cell2) ? parseAbility(cell2) : null;
        if (!ability) {
          break;
        }
        if (!baseStats.abilities) {
          baseStats.abilities = [];
        }
        switch (cell1) {
          case 1:
            baseStats.abilities[0] = ability;
            break;
          case 2:
            baseStats.abilities[1] = ability;
            break;
          default:
            baseStats.abilities[2] = ability;
            break;
        }
        break;
      case 'evs':
        const ev = isNumber(cell2) ? cell2 : parseInt(cell2, 10);
        switch (cell1) {
          case 'HP':
            baseStats.evYield_HP = ev;
            break;
          case 'Atk.':
            baseStats.evYield_Attack = ev;
            break;
          case 'Def.':
            baseStats.evYield_Defense = ev;
            break;
          case 'S.Atk':
            baseStats.evYield_SpAttack = ev;
            break;
          case 'S.Def':
            baseStats.evYield_SpDefense = ev;
            break;
          case 'Spd.':
            baseStats.evYield_Speed = ev;
            break;
          default:
            break;
        }
        break;
      case 'eggGroups':
        const eggGroup = isString(cell2) ? parseEggGroup(cell2) : null;
        if (!eggGroup) {
          break;
        }
        if (!baseStats.eggGroups) {
          baseStats.eggGroups = [];
        }
        switch (cell1) {
          case 1:
            baseStats.eggGroups[0] = eggGroup;
            break;
          case 2:
            baseStats.eggGroups[1] = eggGroup;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
  return baseStats;
}


export async function loadSheet(keyFileLocation: string): Promise<ImportedRow[]> {
  console.log('Loading sheet with key', keyFileLocation);
  const raw = await readFile(keyFileLocation, 'utf8');
  const key: GoogleKeyInfo = JSON.parse(raw);

  const serviceAccountJWT = new JWT({
    email: key.email,
    key: key.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
  const doc = new GoogleSpreadsheet(key.sheetId, serviceAccountJWT);

  await doc.loadInfo();
  // const sheetTitles = [...Object.keys(doc.sheetsByTitle)].sort();
  // // Log the sheet titles as a typescript union type
  // let formattedTitles = '';
  // sheetTitles.forEach((title) => {
  //   formattedTitles += `\n  | '${title}'`;
  // });
  // console.log('Sheet titles:', formattedTitles);

  const gartidexSheet = getSheet(doc, 'Garticdex');
  await gartidexSheet.loadHeaderRow(2);
  const gartidexRows = await gartidexSheet.getRows();
  let gartidexData = gartidexRows.map((row) => {
    return {
      name: row.get('Name').trim(),
      dexNum: parseInt(row.get('Dex No.'), 10),
      type1: row.get('Type 1'),
      type2: row.get('Type 2'),
      category: row.get('Category').trim(),
      habitat: row.get('Habitat'),
      height: parseFloat(row.get('Height\nm')),
      weight: parseFloat(row.get('Weight\nkg')),
      movesetProgress: row.get('Moveset Progress'),
      eggGroup1: parseEggGroup(row.get('Egg Group 1')),
      eggGroup2: parseEggGroup(row.get('Egg Group 2')),
      gender: parseGender(row.get('Gender\nM/F')),
      dexEntry: row.get('Dex Entry') as string,
      catchRate: parseCatchRate(row.get('Catch Rate')),
      basedOn: row.get('Stats\nBased on'),
      color: row.get('Colour')?.toUpperCase(),
    };
  });
  const megaStart = gartidexData.findIndex((m) => m.name.startsWith('Mega '));
  if (megaStart > 0) {
    gartidexData = gartidexData.slice(0, megaStart);
  }
  console.log(`Loaded ${gartidexData.length} dex entries`);

  const dataSheet = getSheet(doc, 'Data');
  await dataSheet.loadCells('X1:Y1000');
  const moveMap: Map<string, string> = new Map();
  for (let i = 1; i < 1000; i++) {
    const move = dataSheet.getCell(i, 23)?.value as string;
    if (!move) {
      break;
    }
    const moveName = dataSheet.getCell(i, 24)?.value as string;
    moveMap.set(moveName.toUpperCase(), move);
  }

  const garticmonSheet = getSheet(doc, 'Garticmon Data');
  console.log(garticmonSheet.rowCount, garticmonSheet.columnCount);
  // // Log the first 10 rows of the sheet
  const groupedRows: (string | number)[][][] = await getGarticmonRowGroups(
    garticmonSheet
  );
  console.log(`Loaded ${groupedRows.length} groups`);

  const monData = groupedRows
    .map((group) => {
      // First row has the dex number and name
      const dexNumAndNameRow = group[0];
      if (isString(dexNumAndNameRow[1]) && dexNumAndNameRow[1].includes('★')) {
        return undefined;
      }
      const dexNum = isNumber(dexNumAndNameRow[1])
        ? dexNumAndNameRow[1]
        : parseInt(dexNumAndNameRow[1], 10);
      const name = isString(dexNumAndNameRow[2]) ? dexNumAndNameRow[2].trim() : '';
      // Second row has headers, skip
      // The rest of the data is formatted in sections
      const dataRows = group.slice(2);
      // The dex data section is in columns 1 and 2 and consists of:
      // Typing, Stats, Abilities, EV Yield, Egg Groups
      const baseData = getStats(dataRows);
      // The level up learnsets section is in columns 3 and 4
      const levelUpMoves: LevelUpMove[] = [];
      dataRows.forEach((row) => {
        const level = row[3];
        const rawMove = row[4];
        if (level != null && isString(rawMove)) {
          const move = moveMap.get(rawMove.toUpperCase());
          if (!move) {
            throw new Error(`Could not find move ${rawMove}`);
          }
          levelUpMoves.push({
            level: isNumber(level) ? level : 0,
            move:  move ?? 'NONE',
          });
        }
      });
      // The remaining cells contain teachable moves
      const teachableMoves: string[] = [];
      dataRows.forEach((row) => {
        const moves = row.slice(5);
        moves.forEach((rawMove) => {
          if (isString(rawMove)) {
            // Strip out HMxx and TMxxx
            rawMove = rawMove.replace(/(HM|TM)\d+\s*/, '');
            const move = moveMap.get(rawMove.toUpperCase());
            if (!move) {
              throw new Error(`Could not find move ${rawMove}`);
            }
            teachableMoves.push(move);
          }
        });
      });
      if (!baseData.eggGroups || baseData.eggGroups.length === 0) {
        return undefined;
      }
      return {
        ...baseData,
        name,
        dexNum,
        levelUpMoves,
        teachableMoves
      };

    })
    .filter(notUndefined);

  return gartidexData
    .map((mon) => {
      const data = monData.find((m) => m.name === mon.name);
      if (!data) {
        return undefined;
      }
      const nationalDexConst = mon.name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
      // Remove trailing underscores
        .replace(/_$/, '');
      const out: ImportedRow = {
        name: mon.name,
        basedOn: mon.basedOn,
        regionalDexNumber: mon.dexNum,
        nationalDexNumber: mon.dexNum,
        height: mon.height,
        weight: mon.weight,
        categoryName: mon.category,
        species: [
          {
            name: mon.name,
            species: nationalDexConst,
            baseHP: data.baseHP,
            baseAttack: data.baseAttack,
            baseDefense: data.baseDefense,
            baseSpAttack: data.baseSpAttack,
            baseSpDefense: data.baseSpDefense,
            baseSpeed: data.baseSpeed,
            types: data.types,
            catchRate: mon.catchRate,
            evYield_HP: data.evYield_HP,
            evYield_Attack: data.evYield_Attack,
            evYield_Defense: data.evYield_Defense,
            evYield_SpAttack: data.evYield_SpAttack,
            evYield_SpDefense: data.evYield_SpDefense,
            evYield_Speed: data.evYield_Speed,
            eggGroups: data.eggGroups,
            abilities: data.abilities,
            genderRatio: mon.gender,
            enemyElevation: 0,
            exclude: false,
            bodyColor: mon.color || 'GRAY',
            learnset: {
              species: nationalDexConst,
              levelUp: data.levelUpMoves,
              teachable: data.teachableMoves,
            },
          },
        ],
        pokemonScale: 1,
        pokemonOffset: 0,
        trainerScale: 1,
        trainerOffset: 0,
        dexEntry: normalizeText(mon.dexEntry).split('\n').map(l => l.trim()) || ['TODO'],
        exclude: false,
      };
      return out;
    })
    .filter(notUndefined);
}

