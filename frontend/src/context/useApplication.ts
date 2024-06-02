import { create } from "zustand";

type Store = {
  uploaded: boolean;
  setUploaded: () => void;
};

export const useApplicationStore = create<Store>()((set) => ({
  uploaded: false,
  setUploaded: () => set((state) => ({ uploaded: true })),
}));
