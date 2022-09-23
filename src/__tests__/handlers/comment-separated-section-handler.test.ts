import { SpeciesData } from '../../common/file-handlers/files/species';
import {
  CommentSeparatedSectionConfig,
  CommentSeparatedSectionHandler,
} from '../../common/file-handlers/handlers/comment-separated-section-handler';
import { DefinesHandler } from '../../common/file-handlers/handlers/defines-handler';

describe('CommentSeparatedSectionHandler', () => {
  const START_COMMENT_CONFIG: CommentSeparatedSectionConfig<SpeciesData[]> = {
    endComment: 'Extra species',
    handler: new DefinesHandler<SpeciesData>({
      constPrefix: 'SPECIES_',
      constProperty: 'species',
      numberProperty: 'number',
    }),
  };

  const START_COMMENT_SAMPLE_SOURCE = `// Other comment\n#define SPECIES_NONE 0\n#define SPECIES_BULBASAUR 1\n#define LAST_CUSTOM_SPECIES SPECIES_BINGLY\n// Extra species\n\n#define SPECIES_TURTWIG LAST_CUSTOM_SPECIES + 1`;

  const START_COMMENT_SAMPLE_DATA: SpeciesData[] = [
    { species: 'NONE', number: 0 },
    { species: 'BULBASAUR', number: 1 },
  ];

  const START_COMMENT_FORMATTED = `#define SPECIES_NONE 0\n#define SPECIES_BULBASAUR 1`;

  const END_COMMENT_CONFIG: CommentSeparatedSectionConfig<SpeciesData[]> = {
    startComment: 'Extra species',
    outputComment: true,
    handler: new DefinesHandler<SpeciesData>({
      constPrefix: 'SPECIES_',
      constProperty: 'species',
      numberProperty: 'number',
      numberPrefix: 'LAST_CUSTOM_SPECIES + ',
    }),
  };

  const END_COMMENT_SAMPLE_SOURCE = `// Other comment\n#define SPECIES_NONE 0\n#define SPECIES_BULBASAUR 1\n// Extra species\n#define SPECIES_TURTWIG LAST_CUSTOM_SPECIES + 1`;

  const END_COMMENT_SAMPLE_DATA: SpeciesData[] = [
    { species: 'TURTWIG', number: 1 },
  ];

  const END_COMMENT_FORMATTED = `// Extra species\n#define SPECIES_TURTWIG LAST_CUSTOM_SPECIES + 1`;

  it('should parse a comment started section', () => {
    const handler = new CommentSeparatedSectionHandler(START_COMMENT_CONFIG);
    const data = handler.parse(START_COMMENT_SAMPLE_SOURCE);
    expect(data.value).toEqual(START_COMMENT_SAMPLE_DATA);
    expect(data.start).toEqual('// Other comment\n'.length);
    expect(data.end).toEqual(
      '// Other comment\n#define SPECIES_NONE 0\n#define SPECIES_BULBASAUR 1'
        .length
    );
  });

  it('should format a comment started section', () => {
    const handler = new CommentSeparatedSectionHandler(START_COMMENT_CONFIG);
    const data = handler.format(START_COMMENT_SAMPLE_DATA);
    expect(data.trim()).toEqual(START_COMMENT_FORMATTED);
  });

  it('should parse a comment ended section', () => {
    const handler = new CommentSeparatedSectionHandler(END_COMMENT_CONFIG);
    const data = handler.parse(END_COMMENT_SAMPLE_SOURCE);
    expect(data.value).toEqual(END_COMMENT_SAMPLE_DATA);
    expect(data.start).toEqual(
      '// Other comment\n#define SPECIES_NONE 0\n#define SPECIES_BULBASAUR 1\n'
        .length
    );
    expect(END_COMMENT_SAMPLE_SOURCE.substring(0, data.end)).toEqual(
      END_COMMENT_SAMPLE_SOURCE
    );
  });

  it('should format a comment ended section', () => {
    const handler = new CommentSeparatedSectionHandler(END_COMMENT_CONFIG);
    const data = handler.format(END_COMMENT_SAMPLE_DATA);
    expect(data.trim()).toEqual(END_COMMENT_FORMATTED);
  });

  it('should parse a comment started setion with no content', () => {
    const handler = new CommentSeparatedSectionHandler({
      handler: START_COMMENT_CONFIG.handler,
      startComment: 'Extra species',
    });
    const data = handler.parse('// Extra species\n\n');
    expect(data.value).toEqual([]);
    expect(data.start).toEqual('// Extra species'.length);
    expect(data.end).toEqual('// Extra species'.length);
  });
});
