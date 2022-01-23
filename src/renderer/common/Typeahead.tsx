import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

export default function Typeahead<
  T extends { label: string },
  Multiple extends boolean | undefined,
  FreeSolo extends boolean | undefined
>({
  ...args
}: Omit<AutocompleteProps<T, Multiple, false, FreeSolo>, 'renderInput'> & {
  label: string;
}) {
  return (
    <Autocomplete
      {...args}
      disablePortal
      autoHighlight
      includeInputInList={false}
      renderInput={(params) => (
        <TextField {...params} label={args.label} variant="standard" />
      )}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option.label, inputValue);
        const parts = parse(option.label, matches);

        return (
          <li {...props}>
            <div>
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
          </li>
        );
      }}
    />
  );
}
