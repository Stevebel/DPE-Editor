import { ZodError } from 'zod';
import { NestedPath } from '../../../common/ts-utils';

function getParent<T extends object>(obj: T, path: NestedPath<T>) {
  let parent: any = obj;
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent[path[i]];
  }
  return parent;
}
function getProperty(path: NestedPath<any>) {
  return path[path.length - 1];
}

export interface CanUpdatePath {
  updatePath: <Path extends NestedPath<this>>(
    newValue: any,
    path: Path
  ) => void;
  getErrorForPath: (path: NestedPath<this>) => string | null;
}

export function doUpdatePath<T extends object, Path extends NestedPath<T>>(
  obj: T,
  newValue: any,
  path: Path
) {
  const parent = getParent(obj, path);
  const property = getProperty(path);
  parent[property] = newValue as any;
}

export function getErrorByPath(
  errors: ZodError<any> | null,
  path: any[]
): string | null {
  if (!errors) {
    return null;
  }
  return (
    errors.issues.find((i) => i.path.join('.') === path.join('.'))?.message ||
    null
  );
}

export function getValueFor<T extends object, Path extends NestedPath<T>>(
  obj: T,
  path: Path
): any {
  const parent = getParent(obj, path);
  const property = getProperty(path);
  return parent[property] as any;
}
