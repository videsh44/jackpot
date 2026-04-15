'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import { Game } from '@/types/game';
import { FavoriteButton } from '@/components/features/FavoriteButton/FavoriteButton';
import { useGameModalStore, GAME_LIST } from '@/store/useGameModalStore';
import styles from './GameCard.module.scss';

interface GameCardProps {
  game: Game;
  gameIndex?: number;
}

export function GameCard({ game, gameIndex = 0 }: GameCardProps) {
  const openGameModal = useGameModalStore((s) => s.openGameModal);

  const handleOpen = useCallback(() => {
    const gameType = GAME_LIST[gameIndex % GAME_LIST.length];
    openGameModal(gameType);
  }, [gameIndex, openGameModal]);

  return (
    <div
      className={styles.card}
      style={{ borderColor: game.borderColor }}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(); }}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={game.thumbnail}
          alt={game.name}
          fill
          sizes="(max-width: 480px) 140px, (max-width: 768px) 155px, 170px"
          className={styles.image}
          placeholder="blur"
          blurDataURL={game.thumbnailBlur}
        />
        <div className={styles.favoriteWrapper}>
          <FavoriteButton slug={game.slug} />
        </div>
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{game.name}</span>
        <span className={styles.vendor}>{game.vendor}</span>
      </div>
    </div>
  );
}
