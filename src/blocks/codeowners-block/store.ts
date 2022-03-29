import { FileBlockProps } from "@githubnext/utils";
import create from "zustand";

interface CodeownersBlockStore {
  owners: string[];
  setOwners: (owners: string[]) => void;
  addOwner: (owner: string) => void;
  removeOwner: (owner: string) => void;
  blockProps?: FileBlockProps;
  setFileBlockProps: (blockProps: FileBlockProps) => void;
}

export const useStore = create<CodeownersBlockStore>((set) => ({
  owners: [],
  blockProps: undefined,
  setFileBlockProps: (blockProps) => set((state) => ({ ...state, blockProps })),
  addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
  removeOwner: (owner) =>
    set((state) => ({ owners: state.owners.filter((o) => o !== owner) })),
  setOwners: (owners: string[]) => set((state) => ({ ...state, owners })),
}));
