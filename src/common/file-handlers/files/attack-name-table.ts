import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { messageHandler } from '../handlers/message-handler';
import { getProp } from '../handlers/struct-handler';

// Decomp

export interface AttackNameTable {
  attackNames: AttackName[];
  longAttackNames: AttackName[];
}
export interface AttackName {
  nameConst: string;
  name: string;
}

export const AttackNameTableSourceDef: SourceFileDefinition<AttackNameTable> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/text/move_names.h',
    },
  ],
  schema: {
    longAttackNames: new ArrayHandler<AttackName>({
      definition:
        'const u8 gLongMoveNames[MOVES_COUNT][LONG_MOVE_NAME_LENGTH + 1]',
      indexProperty: 'nameConst',
      indexPrefix: 'MOVE_',
      propHandler: getProp('name', messageHandler(16)),
    }),
    attackNames: new ArrayHandler<AttackName>({
      definition: 'const u8 gMoveNames[MOVES_COUNT][MOVE_NAME_LENGTH + 1]',
      indexProperty: 'nameConst',
      indexPrefix: 'MOVE_',
      propHandler: getProp('name', messageHandler(12)),
    }),
  },
};
