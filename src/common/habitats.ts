import {
  HabitatPages,
  HabitatTable,
} from './file-handlers/files/habitat-table';
import { habitatConsts } from './lookup-values';
import { IPokemonSpeciesData } from './pokemon-data.interface';

function groupIntoPages(
  species: IPokemonSpeciesData[]
): IPokemonSpeciesData[][] {
  // Group species into pages of at most 4
  // attempting to keep all species of the same dex number on the same page
  // and evolutions on the same page

  const pages: IPokemonSpeciesData[][] = [];
  let page: IPokemonSpeciesData[] = [];
  let lastDexNumber = -1;
  let groupPage = false;

  species.forEach((s) => {
    if (
      lastDexNumber === s.regionalDexNumber! ||
      page.some((p) => p.evolutions?.some((e) => e.targetSpecies === s.species))
    ) {
      page.push(s);
      groupPage = true;
    } else {
      if (groupPage && page.length > 0) {
        pages.push(page);
        page = [];
      }
      page.push(s);
      groupPage = false;
    }

    lastDexNumber = s.regionalDexNumber!;

    if (page.length >= 4) {
      pages.push(page);
      page = [];
    }
  });
  if (page.length > 0) {
    pages.push(page);
  }
  return pages;
}

export function getHabitatTable(species: IPokemonSpeciesData[]): HabitatTable {
  const habitatTable: HabitatTable = {
    pages: [],
    habitats: [],
  };

  habitatConsts.forEach((h) => {
    const habitatPages: HabitatPages = {
      name: h,
      pages: [],
    };

    const speciesInHabitat = species
      .filter((s) => s.habitat === h && s.regionalDexNumber !== undefined)
      .sort((a, b) => a.regionalDexNumber! - b.regionalDexNumber!);
    const pages = groupIntoPages(speciesInHabitat);

    habitatPages.pages = pages.map((pg, i) => ({
      name: `${h}Page${i + 1}`,
      species: pg.map((s) => s.species),
    }));

    if (habitatPages.pages.length === 0) {
      habitatPages.pages.push({
        name: `${h}Page1`,
        species: ['NONE'],
      });
    }

    habitatTable.pages = [...habitatTable.pages, ...habitatPages.pages];
    habitatTable.habitats.push(habitatPages);
  });

  return habitatTable;
}
