import { useInfiniteQuery } from '@tanstack/react-query';
import { getGames } from '@/services/games.service';
import { Category, SortField, SortOrder } from '@/types/game';
import { PAGE_SIZE } from '@/constants';

interface UseGamesParams {
  category?: Category | null;
  vendor?: string | null;
  sort?: SortField;
  order?: SortOrder;
  enabled?: boolean;
}

export function useGames({
  category,
  vendor,
  sort = 'popularity',
  order = 'desc',
  enabled = true,
}: UseGamesParams = {}) {
  return useInfiniteQuery({
    queryKey: [
      'games',
      { category: category ?? undefined, vendor: vendor ?? undefined, sort, order },
    ],
    queryFn: ({ pageParam = 0, signal }) =>
      getGames(
        {
          limit: PAGE_SIZE,
          offset: pageParam,
          sort,
          order,
          category: category ?? undefined,
          vendor: vendor ?? undefined,
        },
        signal
      ),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, page) => sum + (page.data.items?.length ?? 0),
        0
      );
      if (loaded >= lastPage.data.total) return undefined;
      return loaded;
    },
    initialPageParam: 0,
    enabled,
  });
}
