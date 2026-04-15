'use client';

import { useRef, useCallback } from 'react';
import { Game } from '@/types/game';
import { GameCard } from '@/components/ui/GameCard/GameCard';
import { GameCardSkeleton } from '@/components/ui/GameCard/GameCardSkeleton';
import styles from './GameSection.module.scss';

interface GameSectionProps {
  title: string;
  icon: React.ReactNode;
  games: Game[];
  isLoading: boolean;
  onViewAll?: () => void;
}

export function GameSection({
  title,
  icon,
  games,
  isLoading,
  onViewAll,
}: GameSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 540;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  if (!isLoading && games.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon}>{icon}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.controls}>
          {onViewAll && (
            <button className={styles.viewAll} onClick={onViewAll} type="button">
              View All
            </button>
          )}
          <div className={styles.arrows}>
            <button
              className={styles.arrowButton}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={styles.arrowButton}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        <div className={styles.carousel} ref={scrollRef}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.cardSlot}>
                  <GameCardSkeleton />
                </div>
              ))
            : games.map((game, index) => (
                <div key={game.slug} className={styles.cardSlot}>
                  <GameCard game={game} gameIndex={index} />
                </div>
              ))}
        </div>
        <div className={styles.gradientRight} />
      </div>
    </section>
  );
}
