import { useQuery } from '@tanstack/react-query';
import { getGames } from '@/services/games.service';
import { Category } from '@/types/game';

interface UseGamesByCategoryParams {
  category?: Category;
  vendor?: string;
  featured?: boolean;
  sort?: string;
  limit?: number;
}

export function useGamesByCategory({
  category,
  vendor,
  featured,
  sort,
  limit = 12,
}: UseGamesByCategoryParams) {
  return useQuery({
    queryKey: ['games-section', { category, vendor, featured, sort }],
    queryFn: ({ signal }) =>
      getGames(
        {
          limit,
          offset: 0,
          category,
          vendor,
          sort: featured ? 'featuredPriority' : sort as 'popularity' | undefined,
          order: featured ? 'asc' : 'desc',
        },
        signal
      ),
  });
}
