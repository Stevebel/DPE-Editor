import { FormControlLabel, Switch } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ChangeEvent } from 'react';
import { CanUpdatePath } from './CanUpdatePath.interface';
import { CommonObservableFieldProps, ObservableField } from './ObservableField';

export const ObservableSwitch = observer(
  <T extends CanUpdatePath>(props: CommonObservableFieldProps<T>) => {
    return (
      <ObservableField
        {...props}
        field={(o) => {
          const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
            o.onChange(e.target.checked);

          return (
            <FormControlLabel
              control={
                <Switch checked={o.value || false} onChange={handleChange} />
              }
              label={props.label}
            />
          );
        }}
      />
    );
  }
);
