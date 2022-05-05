import { FormControl, Textarea } from "@primer/react";
import { forwardRef } from "react";
import { FieldError } from "react-hook-form";

interface CommentInputProps {
  value: string;
  isSubmitting: boolean;
  isValidating: boolean;
  error?: FieldError;
}

export function CommentInputComponent(props: CommentInputProps, ref: any) {
  const { value, isSubmitting, isValidating, error, ...rest } = props;
  return (
    <FormControl disabled={isSubmitting}>
      <FormControl.Label>Comment</FormControl.Label>
      <Textarea
        ref={ref}
        rows={2}
        className="font-mono"
        placeholder="Enter comment"
        value={value}
        {...rest}
      />
      {error && (
        <FormControl.Validation variant="error">
          Please ensure each line of the comment starts with a # unless empty.
        </FormControl.Validation>
      )}
      <FormControl.Caption>Each line must begin with "#"</FormControl.Caption>
    </FormControl>
  );
}

export const CommentInput = forwardRef(CommentInputComponent);
