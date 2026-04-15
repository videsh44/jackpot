'use client';

import { useCallback } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useGames } from '@/hooks/useGames';
import { useSearchGames } from '@/hooks/useSearchGames';
import { useGamesByCategory } from '@/hooks/useGamesByCategory';
import { Header } from '@/components/shared/Header/Header';
import { GameModal } from '@/components/shared/GameModal/GameModal';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { PromoBanner } from '@/components/features/PromoBanner/PromoBanner';
import { CategoryFilter } from '@/components/features/CategoryFilter/CategoryFilter';
import { GameSection } from '@/components/features/GameSection/GameSection';
import { GameGrid } from '@/components/features/GameGrid/GameGrid';
import { LOBBY_SECTIONS, MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '@/constants';
import { SECTION_ICON_MAP } from '@/components/ui/SectionIcons/SectionIcons';
import { Category } from '@/types/game';
import styles from './GameLobby.module.scss';

function LobbySection({
  id,
  title,
  category,
  vendor,
  featured,
  sort,
  onViewAll,
}: {
  id: string;
  title: string;
  category?: Category;
  vendor?: string;
  featured?: boolean;
  sort?: string;
  onViewAll: () => void;
}) {
  const { data, isLoading } = useGamesByCategory({
    category,
    vendor,
    featured,
    sort,
  });

  const games = data?.data.items ?? [];
  const IconComponent = SECTION_ICON_MAP[id];

  return (
    <GameSection
      title={title}
      icon={IconComponent ? <IconComponent /> : null}
      games={games}
      isLoading={isLoading}
      onViewAll={onViewAll}
    />
  );
}

export function GameLobby() {
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const category = useFilterStore((s) => s.category);
  const vendor = useFilterStore((s) => s.vendor);
  const sort = useFilterStore((s) => s.sort);
  const order = useFilterStore((s) => s.order);
  const setCategory = useFilterStore((s) => s.setCategory);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);

  const debouncedQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const isSearchMode = debouncedQuery.length >= MIN_SEARCH_LENGTH;
  const isFilterMode = category !== null;
  const isBrowseMode = !isSearchMode && !isFilterMode;

  const gamesQuery = useGames({
    category,
    vendor,
    sort,
    order,
    enabled: isFilterMode,
  });

  const searchResult = useSearchGames(debouncedQuery);

  const filteredGames = isSearchMode
    ? (searchResult.data?.data.items ?? [])
    : isFilterMode
      ? (gamesQuery.data?.pages.flatMap((p) => p.data.items ?? []) ?? [])
      : [];

  const handleViewAll = useCallback(
    (sectionCategory?: Category) => {
      if (sectionCategory) {
        setCategory(sectionCategory);
      }
    },
    [setCategory]
  );

  return (
    <div className={styles.lobby}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <PromoBanner />

          <div className={styles.searchWrapper}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {!isSearchMode && (
            <CategoryFilter />
          )}

          {isBrowseMode && (
            <div className={styles.sections}>
              {LOBBY_SECTIONS.map((section) => (
                <LobbySection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  category={section.category}
                  vendor={section.vendor}
                  featured={section.featured}
                  sort={section.sort}
                  onViewAll={() => handleViewAll(section.category)}
                />
              ))}
            </div>
          )}

          {(isSearchMode || isFilterMode) && (
            <GameGrid
              games={filteredGames}
              isLoading={
                isSearchMode ? searchResult.isLoading : gamesQuery.isLoading
              }
              isError={
                isSearchMode ? searchResult.isError : gamesQuery.isError
              }
              hasNextPage={isFilterMode ? gamesQuery.hasNextPage : false}
              isFetchingNextPage={
                isFilterMode ? gamesQuery.isFetchingNextPage : false
              }
              fetchNextPage={
                isFilterMode ? gamesQuery.fetchNextPage : undefined
              }
              onRetry={() => {
                if (isSearchMode) searchResult.refetch();
                else gamesQuery.refetch();
              }}
            />
          )}
        </div>
      </main>
      <GameModal />
    </div>
  );
}
