export interface SourceFileDefinition<T> {
  location: SourceLocation[];
  schema: {
    [K in keyof T]?: SourceValueHandler<T[K]>;
  };
}
export interface SourceLocation {
  folder: 'src';
  fileName: string;
}

export interface SourceValueHandler<T> {
  parse: (raw: string) => ParseData<T>;
  format: (value: T) => string;
}

export type ParseData<T> = {
  start: number;
  end: number;
  value: T;
};
