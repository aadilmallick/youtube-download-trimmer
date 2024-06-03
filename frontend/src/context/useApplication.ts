import { create } from "zustand";

type Store = {
  uploaded: boolean;
  setUploaded: () => void;
  blobUrl: string;
  setBlobUrl: (blobUrl: string) => void;
};

export const useApplicationStore = create<Store>()((set) => ({
  uploaded: false,
  setUploaded: () => set((state) => ({ uploaded: true })),
  blobUrl: "",
  setBlobUrl: (blobUrl: string) => set((state) => ({ blobUrl })),
}));
