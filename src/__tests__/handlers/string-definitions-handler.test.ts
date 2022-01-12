import {
  StringDefinitionsConfig,
  StringDefinitionsHandler,
} from '../../common/file-handlers/handlers/string-definitions-handler';
import { trimMultiline } from '../../common/test-utils';

describe('StringDefinitionsHandler', () => {
  type PokemonName = {
    nameConst: string;
    name: string;
  };
  const DEFAULT_CONFIG: StringDefinitionsConfig<PokemonName> = {
    constProperty: 'nameConst',
    constPrefix: 'NAME_',
    stringProperty: 'name',
  };

  const SAMPLE_SOURCE = `
    #org @NAME_PIKACHU
    Pikachu

    #org @NAME_RAICHU
    Raichu

  `;

  const SAMPLE_DATA = [
    { nameConst: 'PIKACHU', name: 'Pikachu' },
    { nameConst: 'RAICHU', name: 'Raichu' },
  ];

  const CONFIG_WITH_ESCAPED_CHARS: StringDefinitionsConfig<PokemonName> = {
    constProperty: 'nameConst',
    constPrefix: 'DEX_ENTRY_',
    stringProperty: 'name',
  };

  const SAMPLE_SOURCE_WITH_ESCAPED_CHARS = `
    #org @DEX_ENTRY_SKIDDO
    Thought to be one of the first Pok\\emon\\nto live in harmony with humans, it has\\na placid disposition.

    #org @DEX_ENTRY_GOGOAT
    They inhabit mountainous regions. The\\nleader of the herd is decided by a\\nbattle of clashing horns.
  `;

  const SAMPLE_DATA_WITH_ESCAPED_CHARS = [
    {
      nameConst: 'SKIDDO',
      name: 'Thought to be one of the first Pokémon\nto live in harmony with humans, it has\na placid disposition.',
    },
    {
      nameConst: 'GOGOAT',
      name: 'They inhabit mountainous regions. The\nleader of the herd is decided by a\nbattle of clashing horns.',
    },
  ];

  it('should parse', () => {
    const handler = new StringDefinitionsHandler(DEFAULT_CONFIG);
    const data = handler.parse(SAMPLE_SOURCE);
    expect(data.value).toEqual(SAMPLE_DATA);
  });

  it('should format', () => {
    const handler = new StringDefinitionsHandler(DEFAULT_CONFIG);
    const str = handler.format(SAMPLE_DATA);
    expect(trimMultiline(str)).toBe(trimMultiline(SAMPLE_SOURCE));
  });

  it('should parse with escaped chars', () => {
    const handler = new StringDefinitionsHandler(CONFIG_WITH_ESCAPED_CHARS);
    const data = handler.parse(SAMPLE_SOURCE_WITH_ESCAPED_CHARS);
    expect(data.value).toEqual(SAMPLE_DATA_WITH_ESCAPED_CHARS);
  });

  it('should format with escaped chars', () => {
    const handler = new StringDefinitionsHandler(CONFIG_WITH_ESCAPED_CHARS);
    const str = handler.format(SAMPLE_DATA_WITH_ESCAPED_CHARS);
    expect(trimMultiline(str)).toBe(
      trimMultiline(SAMPLE_SOURCE_WITH_ESCAPED_CHARS)
    );
  });
});
