import { Autocomplete, FormControl, TextInputWithTokens } from "@primer/react";
import { matchSorter } from "match-sorter";
import { forwardRef, useState } from "react";
import { FieldError } from "react-hook-form";
import toast from "react-hot-toast";
import { Item } from "./lib";
import { useStore } from "./store";

interface OwnersInputProps {
  value: string[];
  onChange: (...event: any[]) => void;
  error?: FieldError[];
}

export function OwnersInputComponent(props: OwnersInputProps, ref: any) {
  const { value, error, ...rest } = props;
  const [filterValue, setFilterValue] = useState("");
  const globalOwners = useStore((state) => state.owners);
  const addOwner = useStore((state) => state.addOwner);

  let tokens = value.map((owner) => {
    return {
      id: owner,
      text: owner,
    };
  });

  let items = globalOwners.map((option) => {
    return {
      id: option,
      text: option,
    };
  });

  let canAddNewItem =
    filterValue.length > 0 && matchSorter(value, filterValue).length === 0;

  const handleSelectedChange = (items: Item[] | Item) => {
    if (Array.isArray(items)) {
      props.onChange(items.map((item) => item.id));
    } else {
      // Not relevant, since we are in multiple select mode.
    }
  };

  const handleRemove = (id: string) => {
    props.onChange(value.filter((owner) => owner !== id));
  };

  return (
    <FormControl>
      <FormControl.Label>Choose users</FormControl.Label>
      {error && (
        <FormControl.Validation variant="error">
          Please provide a list of code owners.
        </FormControl.Validation>
      )}
      <Autocomplete>
        {/* @ts-ignore */}
        <Autocomplete.Input
          ref={ref}
          preventTokenWrapping
          validationStatus={error ? "error" : undefined}
          autocomplete="off"
          type="search"
          size="medium"
          placeholder="Enter username or email"
          as={TextInputWithTokens}
          {...rest}
          tokens={tokens}
          value={filterValue}
          onChange={(e: any) => setFilterValue(e.target.value)}
          // tokenComponent={TokenComponent}
          onTokenRemove={handleRemove}
        />
        <Autocomplete.Overlay>
          <Autocomplete.Menu
            items={items}
            addNewItem={
              canAddNewItem
                ? {
                    text: `Add '${filterValue}'`,
                    handleAddItem: () => {
                      if (!filterValue.includes("@")) {
                        toast.error(
                          "Please enter a valid email address or username beginning with @",
                          {
                            position: "top-right",
                          }
                        );
                        setFilterValue("");
                        return;
                      }

                      props.onChange([...value, filterValue]);
                      addOwner(filterValue);
                      setFilterValue("");
                    },
                  }
                : undefined
            }
            selectedItemIds={value}
            onSelectedChange={handleSelectedChange}
            selectionVariant="multiple"
          />
        </Autocomplete.Overlay>
      </Autocomplete>
    </FormControl>
  );
}

export const OwnersInput = forwardRef(OwnersInputComponent);
