# Jackpot.bet - Casino Game Lobby

A responsive casino game lobby built with Next.js 14+, featuring real-time search, category filtering, infinite scroll, and game favoriting.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: SCSS Modules
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Font**: Poppins (via next/font)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file (already included):

```
NEXT_PUBLIC_API_BASE_URL=https://jpapi-staging.jackpot.bet
```

## Project Structure

```
src/
├── app/                     # Next.js App Router (layout, page, error, loading)
├── components/
│   ├── ui/                  # Reusable primitives (GameCard, SearchInput, Skeleton, Badge)
│   ├── shared/              # Shared components (Header, Providers, LoadMoreTrigger)
│   └── features/            # Feature components (GameLobby, GameSection, GameGrid, etc.)
├── hooks/                   # Custom hooks (useGames, useSearchGames, useDebounce, etc.)
├── lib/                     # API client, QueryClient config
├── services/                # API service layer (games.service.ts)
├── store/                   # Zustand stores (filters, favorites)
├── types/                   # TypeScript interfaces
├── constants/               # App constants (categories, vendors, API config)
├── utils/                   # Utility functions
└── styles/                  # SCSS variables, mixins, reset
```

## Architecture Decisions

### Two Display Modes
- **Browse Mode** (default): Shows categorized game sections with horizontal carousels matching the Figma design. Each section fetches its own data independently.
- **Search/Filter Mode**: When a search query is entered or a category filter is selected, the UI switches to a flat grid layout with infinite scroll.

### Search & Filters are Mutually Exclusive
The two API endpoints serve different purposes:
- `/casino/games` supports pagination and filtering (used for browse + filter modes)
- `/casino/games/search` returns all matches at once (used for search mode)

Typing a search disables filters; clicking a filter clears the search.

### State Management Split
- **Zustand (`useFilterStore`)**: Manages search query, active category, vendor, and sort preferences. Drives which API endpoint and parameters are used.
- **Zustand (`useFavoriteStore`)**: Manages favorited game slugs, persisted to localStorage via Zustand's `persist` middleware.
- **React Query**: Handles all server state (caching, deduplication, background refetching, pagination).

### Infinite Scroll
Implemented via `IntersectionObserver` with a sentinel element. The `useGames` hook uses `useInfiniteQuery` with offset-based pagination (24 items per page). The observer triggers `fetchNextPage` when the sentinel enters the viewport with a 200px root margin for prefetching.

### Abort Controllers
TanStack Query v5 automatically passes `AbortSignal` to query functions. The service layer forwards this to `fetch()`, ensuring rapid filter changes cancel in-flight requests and prevent stale data.

## API Endpoints

| Endpoint | Purpose | Pagination |
|---|---|---|
| `GET /casino/games` | List games with filters | Yes (limit/offset) |
| `GET /casino/games/search?query=X` | Search games by name | No (returns all) |

## Features

- Dark-themed casino lobby matching Figma design
- Real-time search with 300ms debounce
- Category filtering (Slots, Blackjack, Baccarat, Live Dealer)
- Horizontal carousel sections with scroll arrows and gradient fade
- Infinite scroll pagination in filter mode
- Game favoriting with localStorage persistence
- Skeleton loading states
- Error states with retry
- Responsive design (mobile-first)
- Optimized images with blur placeholders via next/image
