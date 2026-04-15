import { apiFetch } from '@/lib/api';
import { GameListParams, GamesResponse, SearchResponse } from '@/types/game';

export async function getGames(
  params: GameListParams = {},
  signal?: AbortSignal
): Promise<GamesResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    limit: params.limit,
    offset: params.offset,
    sort: params.sort,
    order: params.order,
    category: params.category,
    vendor: params.vendor,
    excludeCategory: params.excludeCategory,
  };

  return apiFetch<GamesResponse>('/casino/games', queryParams, signal);
}

export async function searchGames(
  query: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  return apiFetch<SearchResponse>('/casino/games/search', { query }, signal);
}
