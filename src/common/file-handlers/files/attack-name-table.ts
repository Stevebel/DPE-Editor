import { SourceFileDefinition } from '../file-handler.interface';
import { StringDefinitionsHandler } from '../handlers/string-definitions-handler';

export interface AttackNameTable {
  attackNames: AttackName[];
}
export interface AttackName {
  nameConst: string;
  name: string;
}

export const AttackNameTableSourceDef: SourceFileDefinition<AttackNameTable> = {
  location: [
    {
      folder: 'src',
      fileName: 'strings/attack_name_table.string',
    },
  ],
  schema: {
    attackNames: new StringDefinitionsHandler<AttackName>({
      constProperty: 'nameConst',
      constPrefix: 'NAME_',
      stringProperty: 'name',
    }),
  },
};
