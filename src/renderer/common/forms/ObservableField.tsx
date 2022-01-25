import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestedPath } from '../../../common/ts-utils';
import { CanUpdatePath, getValueFor } from './CanUpdatePath.interface';

export interface CommonObservableFieldProps<T extends CanUpdatePath> {
  label: string;
  store: T;
  path: NestedPath<T>;
  setter?: keyof T;
  disabled?: boolean;
}

type ObservableFieldProps<T extends CanUpdatePath> =
  CommonObservableFieldProps<T> & {
    field: (props: {
      label: string;
      error: string | null;
      value: any;
      onChange: (value: any) => void;
      disabled: boolean;
    }) => JSX.Element;
  };

export const ObservableField = observer(
  <T extends CanUpdatePath>({
    label,
    store,
    path,
    setter,
    disabled,
    field,
  }: ObservableFieldProps<T>) => {
    const handleChange = (newValue: any) => {
      if (!store) {
        return;
      }
      if (setter) {
        const setFn: (value: string) => void = store[setter] as any;
        setFn.call(store, newValue);
      } else {
        runInAction(() => store.updatePath(newValue as any, path));
      }
    };

    const getError = () => {
      return store.getErrorForPath(path);
    };

    const getValue = () => {
      return getValueFor(store, path);
    };

    return field({
      label,
      error: getError(),
      value: getValue(),
      onChange: handleChange,
      disabled: disabled || false,
    });
  }
);
