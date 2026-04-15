import { create } from 'zustand';

export type GameType = 'crash' | 'mines' | 'dice';

export const GAME_LIST: GameType[] = ['crash', 'mines', 'dice'];

interface GameModalState {
  isOpen: boolean;
  activeGame: GameType;
  openGameModal: (game: GameType) => void;
  openRandomGame: () => void;
  closeGameModal: () => void;
}

export const useGameModalStore = create<GameModalState>((set) => ({
  isOpen: false,
  activeGame: 'crash',
  openGameModal: (game) => set({ isOpen: true, activeGame: game }),
  openRandomGame: () =>
    set({
      isOpen: true,
      activeGame: GAME_LIST[Math.floor(Math.random() * GAME_LIST.length)],
    }),
  closeGameModal: () => set({ isOpen: false }),
}));
