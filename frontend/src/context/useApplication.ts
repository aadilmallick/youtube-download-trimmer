import { create } from "zustand";

type Store = {
  uploaded: boolean;
  setUploaded: () => void;
  blobUrl: string;
  setBlobUrl: (blobUrl: string) => void;
  filePath: string;
  setFilePath: (filePath: string) => void;
};

export const useApplicationStore = create<Store>()((set) => ({
  uploaded: false,
  setUploaded: () => set((state) => ({ uploaded: true })),
  blobUrl: "",
  setBlobUrl: (blobUrl: string) => set((state) => ({ blobUrl })),
  filePath: "",
  setFilePath: (filePath: string) => set((state) => ({ filePath })),
}));
