import { FormControl, TextInput } from "@primer/react";
import { forwardRef } from "react";

interface PatternInputProps {
  value: string;
}

// TODO: handle error
export function PatternInputComponent(props: PatternInputProps, ref: any) {
  const { value, ...rest } = props;
  return (
    <FormControl>
      <FormControl.Label>Rule</FormControl.Label>
      <TextInput
        monospace
        placeholder="Enter pattern"
        value={value}
        {...rest}
      />
      {/* {meta.error && (
        <FormControl.Validation variant="error">
          Please provide a valid path.
        </FormControl.Validation>
      )} */}
    </FormControl>
  );
}

export const PatternInput = forwardRef(PatternInputComponent);
