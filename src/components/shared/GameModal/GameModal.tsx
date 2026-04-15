'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameModalStore, type GameType } from '@/store/useGameModalStore';
import styles from './GameModal.module.scss';

const CrashGame = dynamic(
  () => import('@/components/features/CrashGame/CrashGame').then((mod) => mod.CrashGame),
  { ssr: false, loading: () => <div className={styles.loading}>Loading Crash...</div> }
);

const MinesGame = dynamic(
  () => import('@/components/features/MinesGame/MinesGame').then((mod) => mod.MinesGame),
  { ssr: false, loading: () => <div className={styles.loading}>Loading Mines...</div> }
);

const DiceGame = dynamic(
  () => import('@/components/features/DiceGame/DiceGame').then((mod) => mod.DiceGame),
  { ssr: false, loading: () => <div className={styles.loading}>Loading Dice...</div> }
);

const GAME_COMPONENTS: Record<GameType, React.ComponentType> = {
  crash: CrashGame,
  mines: MinesGame,
  dice: DiceGame,
};

const GAME_LABELS: Record<GameType, string> = {
  crash: 'Crash Velocity',
  mines: 'Emerald Mines',
  dice: 'Neon Dice',
};

export function GameModal() {
  const isOpen = useGameModalStore((s) => s.isOpen);
  const activeGame = useGameModalStore((s) => s.activeGame);
  const openGameModal = useGameModalStore((s) => s.openGameModal);
  const closeGameModal = useGameModalStore((s) => s.closeGameModal);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGameModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeGameModal]);

  if (!isOpen) return null;

  const ActiveGame = GAME_COMPONENTS[activeGame];

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&family=Manrope:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    <div className={styles.overlay} onClick={closeGameModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className={styles.header}>
          <div className={styles.tabs}>
            {(Object.keys(GAME_LABELS) as GameType[]).map((game) => (
              <button
                key={game}
                className={`${styles.tab} ${activeGame === game ? styles.tabActive : ''}`}
                onClick={() => openGameModal(game)}
                type="button"
              >
                {GAME_LABELS[game]}
              </button>
            ))}
          </div>
          <button
            className={styles.closeButton}
            onClick={closeGameModal}
            type="button"
            aria-label="Close game"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Game Content */}
        <div className={styles.content}>
          <ActiveGame />
        </div>
      </div>
    </div>
    </>
  );
}
