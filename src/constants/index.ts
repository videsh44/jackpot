import { Category } from '@/types/game';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jpapi-staging.jackpot.bet';

export const PAGE_SIZE = 24;

export const SEARCH_DEBOUNCE_MS = 300;

export const MIN_SEARCH_LENGTH = 2;

export interface CategoryOption {
  value: Category;
  label: string;
}

export const CATEGORIES: CategoryOption[] = [
  { value: 'VIDEOSLOTS', label: 'Slots' },
  { value: 'BLACKJACK', label: 'Blackjack' },
  { value: 'BACCARAT', label: 'Baccarat' },
  { value: 'GAMESHOWSLIVEDEALER', label: 'Live Dealer' },
];

export interface VendorOption {
  value: string;
  label: string;
}

export const VENDORS: VendorOption[] = [
  { value: 'PragmaticPlay', label: 'Pragmatic Play' },
  { value: 'EvolutionGaming', label: 'Evolution Gaming' },
  { value: 'JackpotOriginal', label: 'Jackpot Originals' },
  { value: "Play'nGo", label: "Play'n Go" },
  { value: 'RelaxGaming', label: 'Relax Gaming' },
];

export interface SectionConfig {
  id: string;
  title: string;
  icon: string;
  category?: Category;
  vendor?: string;
  featured?: boolean;
  sort?: string;
}

export const LOBBY_SECTIONS: SectionConfig[] = [
  { id: 'featured', title: 'Featured Games', icon: '⭐', featured: true, sort: 'featuredPriority' },
  { id: 'originals', title: 'Jackpot Originals', icon: '🎰', vendor: 'JackpotOriginal' },
  { id: 'slots', title: 'Slots', icon: '🎲', category: 'VIDEOSLOTS' },
  { id: 'table-games', title: 'Table Games', icon: '♠️', category: 'BLACKJACK' },
  { id: 'live-dealer', title: 'Game Shows', icon: '🎪', category: 'GAMESHOWSLIVEDEALER' },
];
