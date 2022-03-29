import { FileBlockProps } from "@githubnext/utils";
import { Button } from "@primer/react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CommentInput } from "./comment-input";
import { parseCodeOwnersFile, Rule, STUB_RULE } from "./lib";
import { OwnersInput } from "./owners-input";
import { PatternInput } from "./pattern-input";
import { useStore } from "./store";

type FormData = {
  rules: Rule[];
};

export function BlockInner(props: FileBlockProps) {
  const { content } = props;
  const parsedContent = parseCodeOwnersFile(content);
  const setOwners = useStore((state) => state.setOwners);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      rules: parsedContent,
    },
  });
  const onSubmit = handleSubmit((data) => console.log(data));
  const { fields, append } = useFieldArray({
    control,
    name: "rules",
  });

  // Cache initial options and populate store with u
  let options = parsedContent.flatMap((rule) => rule.owners);
  useEffect(() => {
    setOwners(options);
  }, [options]);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-0">
      <form onSubmit={onSubmit}>
        {fields.length === 0 ? (
          <div className="pt-6 pb-3">
            <p className="text-sm text-gray-600">
              No rules detected! Add a rule to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {fields.map((field, index) => (
              <div key={field.id} className="Box">
                <div className="flex flex-col gap-4 p-4">
                  <Controller
                    render={({ field }) => <CommentInput {...field} />}
                    name={`rules.${index}.comment`}
                    control={control}
                  />
                  <div className="flex w-full gap-4">
                    <div className="w-[140px] flex-shrink-0">
                      <Controller
                        render={({ field }) => <PatternInput {...field} />}
                        name={`rules.${index}.pattern`}
                        control={control}
                      />
                    </div>
                    <Controller
                      render={({ field }) => {
                        return <OwnersInput {...field} />;
                      }}
                      name={`rules.${index}.owners`}
                      control={control}
                    />
                  </div>
                </div>
              </div>
            ))}
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
