'use client';

import { Game } from '@/types/game';
import { GameCard } from '@/components/ui/GameCard/GameCard';
import { GameCardSkeleton } from '@/components/ui/GameCard/GameCardSkeleton';
import { LoadMoreTrigger } from '@/components/shared/LoadMoreTrigger/LoadMoreTrigger';
import { EmptyState } from '@/components/features/EmptyState/EmptyState';
import styles from './GameGrid.module.scss';

interface GameGridProps {
  games: Game[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  onRetry?: () => void;
}

export function GameGrid({
  games,
  isLoading,
  isError,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  onRetry,
}: GameGridProps) {
  if (isError) {
    return (
      <EmptyState
        title="Something went wrong"
        message="Failed to load games. Please try again."
        onRetry={onRetry}
      />
    );
  }

  if (!isLoading && games.length === 0) {
    return (
      <EmptyState
        title="No games found"
        message="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div>
      <div className={styles.grid}>
        {games.map((game, index) => (
          <GameCard key={game.slug} game={game} gameIndex={index} />
        ))}
        {isLoading &&
          Array.from({ length: 12 }).map((_, i) => (
            <GameCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>
      {fetchNextPage && (
        <LoadMoreTrigger
          onLoadMore={fetchNextPage}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      )}
    </div>
  );
}
