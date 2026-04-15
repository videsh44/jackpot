export interface Game {
  enabled: boolean;
  name: string;
  slug: string;
  vendor: string;
  description: string;
  thumbnail: string;
  thumbnailBlur: string;
  borderColor: string;
  categories: string[];
  theoreticalPayOut: number;
  restrictedTerritories: string[];
  hasFunMode: boolean;
  featured: boolean;
  favorite: boolean;
}

export interface GamesResponse {
  success: boolean;
  data: {
    count: number;
    total: number;
    items: Game[] | null;
  };
}

export interface SearchResponse {
  success: boolean;
  data: {
    items: Game[] | null;
  };
}

export type Category = 'VIDEOSLOTS' | 'BLACKJACK' | 'BACCARAT' | 'GAMESHOWSLIVEDEALER';

export type SortField = 'name' | 'theoreticalPayOut' | 'popularity' | 'createdAt' | 'featuredPriority';

export type SortOrder = 'asc' | 'desc';

export interface GameListParams {
  limit?: number;
  offset?: number;
  sort?: SortField;
  order?: SortOrder;
  category?: Category;
  vendor?: string;
  excludeCategory?: string;
}
