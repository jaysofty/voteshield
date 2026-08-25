import { create } from "zustand";

type OpportunitySearchState = {
  search: string;
  setSearch: (search: string) => void;
  clearSearch: () => void;
};

export const useOpportunitySearch =
  create<OpportunitySearchState>((set) => ({
    search: "",

    setSearch: (search) =>
      set({ search }),

    clearSearch: () =>
      set({ search: "" }),
  }));