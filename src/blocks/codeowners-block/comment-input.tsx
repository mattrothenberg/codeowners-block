import { FormControl, Textarea } from "@primer/react";
import { forwardRef } from "react";

interface CommentInputProps {
  value: string;
}

export function CommentInputComponent(props: CommentInputProps, ref: any) {
  const { value, ...rest } = props;
  return (
    <FormControl>
      <FormControl.Label>Comment</FormControl.Label>
      <Textarea
        ref={ref}
        rows={2}
        className="font-mono"
        placeholder="Enter comment"
        value={value}
        {...rest}
      />
      <FormControl.Caption>Each line must begin with "#"</FormControl.Caption>
    </FormControl>
  );
}

export const CommentInput = forwardRef(CommentInputComponent);
