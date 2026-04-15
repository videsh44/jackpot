import { useQuery } from '@tanstack/react-query';
import { searchGames } from '@/services/games.service';
import { MIN_SEARCH_LENGTH } from '@/constants';

export function useSearchGames(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) => searchGames(query, signal),
    enabled: query.length >= MIN_SEARCH_LENGTH,
  });
}
