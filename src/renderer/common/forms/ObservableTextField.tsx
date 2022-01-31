import { TextField, TextFieldProps } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { CanUpdatePath } from './CanUpdatePath.interface';
import { CommonObservableFieldProps, ObservableField } from './ObservableField';

export const ObservableTextField = observer(
  <T extends CanUpdatePath>(
    props: CommonObservableFieldProps<T> & {
      InputProps?: TextFieldProps['InputProps'];
      multiline?: boolean;
      rows?: number;
      className?: string;
    }
  ) => {
    return (
      <ObservableField
        {...props}
        field={(o) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            o.onChange(e.target.value);

          return (
            <TextField
              label={props.label}
              variant="standard"
              required
              error={o.error != null}
              helperText={o.error}
              value={o.value}
              onChange={handleChange}
              disabled={o.disabled}
              InputProps={props.InputProps}
              multiline={props.multiline}
              rows={props.rows}
              className={props.className}
            />
          );
        }}
      />
    );
  }
);
