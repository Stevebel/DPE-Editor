import { observer } from 'mobx-react-lite';
import Typeahead, { SelectOption } from '../Typeahead';
import { CanUpdatePath } from './CanUpdatePath.interface';
import { CommonObservableFieldProps, ObservableField } from './ObservableField';

export const ObservableDropdownField = observer(
  <T extends CanUpdatePath>(
    props: CommonObservableFieldProps<T> & {
      options: SelectOption[];
    }
  ) => {
    return (
      <ObservableField
        {...props}
        field={(o) => {
          const getOption = (value: string) =>
            props.options.find((opt) => opt.value === value);

          const handleSelect = (option: SelectOption) =>
            o.onChange(option?.value || null);

          return (
            <Typeahead
              label={props.label}
              options={props.options}
              value={getOption(o.value)}
              error={o.error != null}
              helperText={o.error}
              isOptionEqualToValue={(a, b) => a.value === b?.value}
              onChange={(_, option) => handleSelect(option as SelectOption)}
            />
          );
        }}
      />
    );
  }
);
