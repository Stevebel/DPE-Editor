import { ZodError } from 'zod';
import { NestedPath } from '../../../common/ts-utils';

function getParent(obj: any, path: NestedPath) {
  let parent = obj;
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent[path[i]];
  }
  return parent;
}
function getProperty(path: NestedPath) {
  return path[path.length - 1];
}

export interface CanUpdatePath {
  updatePath: <Path extends NestedPath>(newValue: any, path: Path) => void;
  getErrorForPath: (path: NestedPath) => string | null;
}

export function doUpdatePath<T extends object, Path extends NestedPath>(
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

export function getValueFor<T extends object, Path extends NestedPath>(
  obj: T,
  path: Path
): any {
  const parent = getParent(obj, path);
  const property = getProperty(path);
  return parent[property] as any;
}
