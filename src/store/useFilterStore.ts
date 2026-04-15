import { create } from 'zustand';
import { Category, SortField, SortOrder } from '@/types/game';

interface FilterState {
  searchQuery: string;
  category: Category | null;
  vendor: string | null;
  sort: SortField;
  order: SortOrder;

  setSearchQuery: (query: string) => void;
  setCategory: (category: Category | null) => void;
  setVendor: (vendor: string | null) => void;
  setSort: (sort: SortField, order: SortOrder) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  category: null,
  vendor: null,
  sort: 'popularity',
  order: 'desc',

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCategory: (category) =>
    set({ category, searchQuery: '' }),

  setVendor: (vendor) =>
    set({ vendor, searchQuery: '' }),

  setSort: (sort, order) => set({ sort, order }),

  resetFilters: () =>
    set({
      searchQuery: '',
      category: null,
      vendor: null,
      sort: 'popularity',
      order: 'desc',
    }),
}));
