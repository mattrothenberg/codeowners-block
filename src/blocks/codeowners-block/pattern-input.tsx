import { FormControl, TextInput } from "@primer/react";
import { forwardRef } from "react";
import { FieldError } from "react-hook-form";

interface PatternInputProps {
  value: string;
  isSubmitting: boolean;
  isValidating: boolean;
  error?: FieldError;
}

// TODO: handle error
export function PatternInputComponent(props: PatternInputProps, ref: any) {
  const { value, error, isSubmitting, isValidating, ...rest } = props;
  return (
    <FormControl disabled={isSubmitting}>
      <FormControl.Label>Rule</FormControl.Label>
      <TextInput
        ref={ref}
        monospace
        placeholder="Enter pattern"
        value={value}
        {...rest}
      />
      {error && (
        <FormControl.Validation variant="error">
          Please provide a valid path.
        </FormControl.Validation>
      )}
    </FormControl>
  );
}

export const PatternInput = forwardRef(PatternInputComponent);
