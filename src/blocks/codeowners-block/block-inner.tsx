import { FileBlockProps } from "@githubnext/utils";
import { Button } from "@primer/react";
import { useFieldArray, useForm } from "react-hook-form";

import { parseCodeOwnersFile, Rule, STUB_RULE } from "./lib";

type FormData = {
  rules: Rule[];
};

export function BlockInner(props: FileBlockProps) {
  const { content } = props;
  const parsedContent = parseCodeOwnersFile(content);

  const { control, register, handleSubmit } = useForm<FormData>();
  const onSubmit = handleSubmit((data) => console.log(data));
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "rules",
    }
  );

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-0">
      <form onSubmit={onSubmit}>
        {fields.length === 0 && (
          <div className="pt-6 pb-3">
            <p className="text-sm text-gray-600">
              No rules detected! Add a rule to get started.
            </p>
          </div>
        )}
        <div className="pt-4 border-t flex items-center justify-between">
          <Button type="button" onClick={() => append(STUB_RULE)}>
            Add Rule
          </Button>
          <Button variant="primary" type="submit">
            Save File
          </Button>
        </div>
      </form>
    </div>
  );
}
