import { FileBlockProps } from "@githubnext/utils";
import { TrashIcon } from "@primer/octicons-react";
import {
  Autocomplete,
  Button,
  FormControl,
  IconButton,
  Textarea,
  TextInput,
  TextInputWithTokens,
  ThemeProvider,
} from "@primer/react";
import { FastField, FieldArray, Form, Formik } from "formik";
import { matchSorter } from "match-sorter";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { array, object, string } from "yup";

function stringifyRules(rules: Rule[]) {
  let result = ``;
  // convert the rules array to a multiline string.
  rules.forEach((rule) => {
    result += rule.comment + "\n";
    result += rule.pattern + "      " + rule.owners.join(" ") + "\n";
  });

  return result;
}

function parseCodeOwnersFile(content: string) {
  let rules = [];
  let splitByline = content.split("\n");
  let comment = "";
  for (let i = 0; i < splitByline.length; i++) {
    if (splitByline[i].startsWith("#")) {
      comment += splitByline[i] + "\n";
      if (splitByline[i + 1] === "") {
        continue;
      }
      if (!splitByline[i + 1].startsWith("#")) {
        let entry = splitByline[i + 1];
        const [pattern, ...owners] = entry.split(" ");

        rules.push({
          comment: comment.trimEnd(),
          pattern,
          owners: owners.filter(Boolean),
        });
        comment = "";
      }
    }

    if (splitByline[i].length === 0) {
      continue;
    }

    const [pattern, ...owners] = splitByline[i].split(" ");

    rules.push({
      comment: comment.trimEnd(),
      pattern,
      owners: owners.filter(Boolean),
    });
  }
  return rules;
}

const STUB_RULE = {
  pattern: "",
  owners: [],
  comment: "",
};

const ruleObjectSchema = object({
  pattern: string().required(),
  comment: string(),
  owners: array().of(string()).required().min(1),
});

const validationSchema = object({
  rules: array().of(ruleObjectSchema).min(0),
});

interface RuleProps {
  name: string;
  options: string[];
}

interface Rule {
  comment: string;
  pattern: string;
  owners: string[];
}

interface Item {
  text: string;
  id: string;
}

function PatternInput(props: { name: string }) {
  return (
    <FastField name={props.name}>
      {/* @ts-ignore */}
      {({ field, form, meta }) => {
        return (
          <FormControl>
            <FormControl.Label>Rule</FormControl.Label>
            <TextInput
              monospace
              onChange={(e: any) => {
                form.setFieldValue(props.name, e.target.value);
              }}
              placeholder="Enter pattern"
              value={field.value}
            />
            {meta.error && (
              <FormControl.Validation variant="error">
                Please provide a valid path.
              </FormControl.Validation>
            )}
          </FormControl>
        );
      }}
    </FastField>
  );
}

function CommentInput(props: { name: string }) {
  return (
    <FastField name={props.name}>
      {/* @ts-ignore */}
      {({ field, form, meta }) => {
        return (
          <FormControl>
            <FormControl.Label>Comment</FormControl.Label>
            <Textarea
              rows={2}
              validationStatus={meta.error ? "error" : undefined}
              className="font-mono"
              onChange={(e: any) => {
                form.setFieldValue(props.name, e.target.value);
              }}
              placeholder="Enter comment"
              value={field.value}
            />
            <FormControl.Caption>
              Each line must begin with "#"
            </FormControl.Caption>
          </FormControl>
        );
      }}
    </FastField>
  );
}

interface OwnersInputInnerProps {
  name: string;
  options: string[];
  form: any;
  field: any;
  meta: any;
}

function OwnersInputInner(props: OwnersInputInnerProps) {
  const { name, options, field, form, meta } = props;
  let autocompleteItems = options.map((option) => {
    return {
      id: option,
      text: option,
    };
  });
  const [filterValue, setFilterValue] = useState("");
  let canAddNewItem =
    filterValue.length > 0 && matchSorter(options, filterValue).length === 0;
  let owners = field.value as string[];

  let autocompleteTokens = owners.map((owner) => {
    return {
      id: owner,
      text: owner,
    };
  });

  const handleRemove = (id: string) => {
    form.setFieldValue(
      name,
      owners.filter((owner) => owner !== id)
    );
  };

  const handleSelectedChange = (items: Item[] | Item) => {
    if (Array.isArray(items)) {
      form.setFieldValue(
        name,
        items.map((item) => item.id)
      );
    } else {
      // Not relevant, since we are in multiple select mode.
    }
  };

  return (
    <FormControl>
      <FormControl.Label>Choose users</FormControl.Label>
      {meta.error && (
        <FormControl.Validation variant="error">
          Please provide a list of code owners.
        </FormControl.Validation>
      )}
      <Autocomplete>
        {/* @ts-ignore */}
        <Autocomplete.Input
          preventTokenWrapping
          validationStatus={meta.error ? "error" : undefined}
          autocomplete="off"
          type="search"
          size="medium"
          onChange={(e: any) => setFilterValue(e.target.value)}
          placeholder="Enter username or email"
          as={TextInputWithTokens}
          tokens={autocompleteTokens}
          onTokenRemove={handleRemove}
        />
        <Autocomplete.Overlay>
          <Autocomplete.Menu
            items={autocompleteItems}
            addNewItem={
              canAddNewItem
                ? {
                    text: `Add '${filterValue}'`,
                    handleAddItem: (item: any) => {
                      form.setFieldValue(name, [...owners, filterValue]);
                      setFilterValue("");
                    },
                  }
                : undefined
            }
            selectedItemIds={owners}
            onSelectedChange={handleSelectedChange}
            selectionVariant="multiple"
          />
        </Autocomplete.Overlay>
      </Autocomplete>
    </FormControl>
  );
}

function OwnersInput(props: { name: string; options: string[] }) {
  const { options } = props;

  return (
    <FastField name={props.name}>
      {/* @ts-ignore */}
      {({ field, form, meta }) => {
        return (
          <>
            <OwnersInputInner
              name={props.name}
              options={options}
              field={field}
              form={form}
              meta={meta}
            />
          </>
        );
      }}
    </FastField>
  );
}

function Rule(props: RuleProps) {
  const { name, options } = props;

  return (
    <div className="Box">
      <div className="flex flex-col gap-4 p-4">
        <CommentInput name={`${name}.comment`} />
        <div className="flex w-full gap-4">
          <div className="w-[140px] flex-shrink-0">
            <PatternInput name={`${name}.pattern`} />
          </div>
          <OwnersInput options={options} name={`${name}.owners`} />
        </div>
      </div>
    </div>
  );
}

function BlockInner(props: FileBlockProps) {
  const { onRequestGitHubData, context, content, onRequestUpdateContent } =
    props;
  let { repo, owner } = context;

  const { data: contributors } = useQuery(
    ["codeowners-block", "contributors", owner, repo],
    () => {
      onRequestGitHubData(`/repos/${owner}/${repo}/collaborators`);
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  console.log("fetching", contributors);

  const initialValues = {
    rules: parseCodeOwnersFile(content),
  };

  // Cache initial options
  let options = initialValues.rules.flatMap((rule) => rule.owners);

  return (
    <div className="pb-6">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={(values) => {
          onRequestUpdateContent(stringifyRules(values.rules));
        }}
      >
        {({ values }) => {
          return (
            <Form>
              <FieldArray
                name="rules"
                render={(helpers) => {
                  return (
                    <div className="max-w-3xl mx-auto">
                      {values.rules.length === 0 ? (
                        <div className="pt-6 pb-3">
                          <p className="text-sm text-gray-600">
                            No rules detected! Add a rule to get started.
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y">
                          {values.rules.map((_, index) => {
                            return (
                              <li
                                className="flex py-4 items-center gap-4"
                                key={index}
                              >
                                <div className="flex-1 min-w-0 relative">
                                  <Rule
                                    options={options}
                                    name={`rules.${index}`}
                                  />
                                  <div className="absolute top-2 right-2">
                                    <IconButton
                                      type="button"
                                      onClick={() => helpers.remove(index)}
                                      aria-label="Delete rule"
                                      icon={TrashIcon}
                                      variant="danger"
                                    ></IconButton>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <div className="pt-4 border-t flex items-center justify-between">
                        <Button
                          type="button"
                          onClick={() => helpers.push(STUB_RULE)}
                        >
                          Add Rule
                        </Button>
                        <Button variant="primary" type="submit">
                          Save File
                        </Button>
                      </div>
                    </div>
                  );
                }}
              ></FieldArray>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default function (props: FileBlockProps) {
  const queryClient = new QueryClient();

  if (props.context.path !== "CODEOWNERS") {
    return (
      <div className="p-4">
        <p className="text-sm">
          Sorry, but this block only works on{" "}
          <span className="text-mono">CODEOWNERS</span> files.
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BlockInner {...props} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
