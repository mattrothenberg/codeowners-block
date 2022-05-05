import { FileBlockProps } from "@githubnext/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrashIcon } from "@primer/octicons-react";
import { Button, IconButton } from "@primer/react";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { array, object, string } from "yup";
import { CommentInput } from "./comment-input";
import { tw } from "twind";
import {
  parseCodeOwnersFile,
  Rule,
  stringifyRules,
  STUB_RULE,
  validateOwner,
} from "./lib";
import { OwnersInput } from "./owners-input";
import { PatternInput } from "./pattern-input";
import { useStore } from "./store";

type FormData = {
  rules: Rule[];
};

const ruleObjectSchema = object({
  pattern: string().required(),
  comment: string().test("validComment", function (value) {
    if (!value) return true;
    // value is a (potentially multi-line) string.
    // we want to make sure that every line starts with a # character, unless it's empty
    return value
      ? value.split("\n").every((line) => {
          return line.startsWith("#") || line === "";
        })
      : false;
  }),
  owners: array()
    .of(
      string().test("checkValidOwner", function (value) {
        return validateOwner(value).then((res) => {
          useStore.getState().setValidationResult({
            owner: value as string,
            valid: res,
          });
          if (res) return res;
          return this.createError({ message: value });
        });
      })
    )
    .required()
    .min(1),
});

const validationSchema = object({
  rules: array().of(ruleObjectSchema).min(0),
});

export function BlockInner(props: FileBlockProps) {
  const { content, onUpdateContent } = props;
  const parsedContent = useMemo(() => parseCodeOwnersFile(content), [content]);
  const setOwners = useStore((state) => state.setOwners);
  const setBlockProps = useStore((state) => state.setFileBlockProps);

  useEffect(() => {
    setBlockProps(props);
  }, []);

  const { control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      rules: parsedContent,
    },
    resolver: yupResolver(validationSchema),
    criteriaMode: "all",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit((data) => {
    onUpdateContent(stringifyRules(data.rules));
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  // Cache initial options and populate store with u
  let options = parsedContent.flatMap((rule) => rule.owners);
  useEffect(() => {
    setOwners(options);
  }, [options]);

  return (
    <div className={tw`max-w-3xl mx-auto px-4 lg:px-0`}>
      <form onSubmit={onSubmit}>
        {fields.length === 0 ? (
          <div className={tw`pt-6 pb-3`}>
            <p className={tw`text-sm text-gray-600`}>
              No rules detected! Add a rule to get started.
            </p>
          </div>
        ) : (
          <div className={tw`space-y-4 py-4`}>
            {fields.map((field, index) => (
              <div key={field.id} className={tw`Box relative`}>
                <div className={tw`flex flex-col gap-4 px-4 pb-4 pt-5`}>
                  <div className={tw`absolute top-2 right-2`}>
                    <IconButton
                      type="button"
                      onClick={() => remove(index)}
                      variant="danger"
                      icon={TrashIcon}
                    ></IconButton>
                  </div>
                  <Controller
                    render={({ field }) => (
                      <CommentInput
                        isSubmitting={formState.isSubmitting}
                        isValidating={formState.isValidating}
                        error={formState.errors.rules?.[index]?.comment}
                        {...field}
                      />
                    )}
                    name={`rules.${index}.comment`}
                    control={control}
                  />
                  <div className={tw`flex w-full gap-4`}>
                    <div className={tw`w-[140px] flex-shrink-0`}>
                      <Controller
                        render={({ field }) => (
                          <PatternInput
                            isSubmitting={formState.isSubmitting}
                            isValidating={formState.isValidating}
                            error={formState.errors.rules?.[index]?.pattern}
                            {...field}
                          />
                        )}
                        name={`rules.${index}.pattern`}
                        control={control}
                      />
                    </div>
                    <div className={tw`min-w-0 w-full`}>
                      <Controller
                        render={({ field }) => {
                          return (
                            <OwnersInput
                              isSubmitting={formState.isSubmitting}
                              isValidating={formState.isValidating}
                              error={formState.errors.rules?.[index]?.owners}
                              {...field}
                            />
                          );
                        }}
                        name={`rules.${index}.owners`}
                        control={control}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className={tw`pt-4 border-t flex items-center justify-between`}>
          <Button type="button" onClick={() => append(STUB_RULE)}>
            Add Rule
          </Button>
          <Button variant="primary">Confirm Changes</Button>
        </div>
      </form>
    </div>
  );
}
