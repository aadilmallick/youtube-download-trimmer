import { create } from "zustand";
import { set } from "zod";

type Store = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useAPILoading = create<Store>()((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
