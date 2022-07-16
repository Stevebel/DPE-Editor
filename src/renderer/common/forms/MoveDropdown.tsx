import { Autocomplete, TextField } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { observer } from 'mobx-react-lite';
import {
  MoveLk,
  useLookupStoreContext,
} from '../../pokemon-editor/lookups.store';
import { TypeIcon } from '../TypeIcon';
import { CanUpdatePath } from './CanUpdatePath.interface';
import { CommonObservableFieldProps, ObservableField } from './ObservableField';

export const MoveDropdown = observer(
  <T extends CanUpdatePath>(props: CommonObservableFieldProps<T>) => {
    const lookupStore = useLookupStoreContext();
    const { moves } = lookupStore;
    console.log(moves.map((m) => m.name).join('\n'));

    return (
      <ObservableField
        {...props}
        field={(o) => {
          const getOption = (value: string) =>
            moves.find((m) => m.move === value);

          const handleSelect = (option: MoveLk | null) =>
            o.onChange(option?.move || null);

          return (
            <Autocomplete
              className="move-dropdown"
              disablePortal
              autoHighlight
              includeInputInList={false}
              options={moves}
              isOptionEqualToValue={(a, b) => a.move === b?.move}
              onChange={(_, option) => handleSelect(option)}
              value={getOption(o.value)}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={o.error != null}
                  helperText={o.error}
                  label={props.label}
                  variant="standard"
                />
              )}
              renderOption={(renderProps, option, { inputValue }) => {
                const matches = match(option.name, inputValue);
                const parts = parse(option.name, matches);

                return (
                  <li {...renderProps} className="move-option">
                    <TypeIcon type={option.type} />
                    <div className="name">
                      {parts.map((part, index) => (
                        <span
                          // eslint-disable-next-line react/no-array-index-key
                          key={index}
                          style={{
                            fontWeight: part.highlight ? 700 : 400,
                          }}
                        >
                          {part.text}
                        </span>
                      ))}
                    </div>
                    <div className={`split ${option.split}`}>
                      {option.split
                        ? option.split.charAt(0) +
                          option.split.charAt(1).toLowerCase()
                        : '-'}
                    </div>
                    <div className="power">{option.power || '-'}</div>
                  </li>
                );
              }}
            />
          );
        }}
      />
    );
  }
);
