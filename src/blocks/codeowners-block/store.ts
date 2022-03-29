import { FileBlockProps } from "@githubnext/utils";
import create from "zustand";

interface OwnerValidationResult {
  owner: string;
  valid: boolean;
}
interface CodeownersBlockStore {
  owners: string[];
  validatedOwners: {
    [owner: string]: boolean;
  };
  setValidationResult: (owners: OwnerValidationResult) => void;
  setOwners: (owners: string[]) => void;
  addOwner: (owner: string) => void;
  removeOwner: (owner: string) => void;
  blockProps?: FileBlockProps;
  setFileBlockProps: (blockProps: FileBlockProps) => void;
}

export const useStore = create<CodeownersBlockStore>((set) => ({
  owners: [],
  blockProps: undefined,
  validatedOwners: {},
  setValidationResult: (result: OwnerValidationResult) => {
    set((state) => {
      state.validatedOwners[result.owner] = result.valid;
    });
  },
  setFileBlockProps: (blockProps) => set((state) => ({ ...state, blockProps })),
  addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
  removeOwner: (owner) =>
    set((state) => ({ owners: state.owners.filter((o) => o !== owner) })),
  setOwners: (owners: string[]) => set((state) => ({ ...state, owners })),
}));
