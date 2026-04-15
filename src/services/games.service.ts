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

  const url = new URL('/api/casino/games', window.location.origin);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function searchGames(
  query: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  const url = new URL('/api/casino/games/search', window.location.origin);
  url.searchParams.set('query', query);

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
