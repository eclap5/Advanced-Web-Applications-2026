# Advanced React Features - Book Explorer App
This week focuses on advanced React patterns in a practical, UI-driven application. Objective is to build a Book Explorer that fetches data from the Open Library API, supports client-side filtering and sorting, and persists favorites in `localStorage`.

The core learning goals are:

- custom hooks for reusable stateful logic (`useBookSearch`, `useLocalStorage`)
- side effects with `useEffect` (debounced fetching + cleanup)
- performance optimization with `useMemo` for derived data
- typed component composition in React + TypeScript
- Continuance of using Material UI component-based styling and layout

Unlike previous weeks, this week is fully front-end and integrates with an external API.

This demonstration is using Open Library API: https://openlibrary.org/developers/api

# Week 9 Walkthrough

## Libraries and tools used

- `@mui/material`, `@emotion/react`, `@emotion/styled` for UI components and theming

### 1) Define shared types first (`src/types.ts`)

Create interfaces used across hooks and components:

- `Book` (mapped from Open Library response)
- `SearchFilters` (`language`, `sortBy`, `favoritesOnly`)

### 2) Implement API adapter (`src/api.ts`)

Add the Open Library integration:

- `searchBooks(query, signal?)`
- `getCoverUrl(coverId?)`

Important points to explain:

- Keep external API types internal (`OpenLibraryDoc`, `OpenLibraryResponse`), then map to app `Book` type.
- Pass `AbortSignal` so requests can be canceled from hooks.

### 3) Build a generic persistence hook (`src/hooks/useLocalStorage.ts`)

Implement `useLocalStorage<T>(key, initialValue)`:

- initialize state from `localStorage`
- sync changes back to `localStorage` in `useEffect`
- a custom hook encapsulates repeated logic cleanly and remains type-safe through generics.

### 4) Build data-fetching hook (`src/hooks/useBookSearch.ts`)

Implement `useBookSearch(query)` with:

- state: `books`, `loading`, `error`
- minimum query length guard (`< 2` clears results)
- debouncing (`setTimeout(..., 400)`)
- cancellation (`AbortController`) and cleanup

Key React concepts to emphasize:

- side effects belong in `useEffect`
- cleanup prevents race conditions and stale updates
- reusable hook keeps `App.tsx` focused on orchestration

### 5) Implement presentational components

#### `src/components/SearchBar.tsx`
- controlled input for search query
- emits changes via `onQueryChange`

#### `src/components/BookFilters.tsx`
- Material UI controls for language, sorting, and favorites-only toggle
- updates full `SearchFilters` object through `onFiltersChange`

#### `src/components/BookCard.tsx`
- renders cover, metadata, language chips, and favorite action
- handles missing cover image fallback

#### `src/components/BookGrid.tsx`
- maps visible books into responsive MUI `Grid`
- computes favorite status per item

#### `src/components/FavoritesPanel.tsx`
- lists persisted favorites
- shows empty state when no favorites exist

### 6) Compose application logic (`src/App.tsx`)

Wire everything together:

- local state: `query`, `filters`
- persistent state: `favorites` via `useLocalStorage`
- remote data: `books`, `loading`, `error` via `useBookSearch`
- derived data: `visibleBooks` via `useMemo`

`useMemo` pipeline:

1. start from fetched `books`
2. apply language filter
3. optionally filter favorites only
4. sort by title or publish year

Also implement `toggleFavorite(book)` to add/remove by `book.key`.

Render flow to highlight during lecture:

- search + filter controls on top
- left panel favorites, right panel result area
- status states: minimum-query hint, loading spinner, error alert, or results grid

### 7) Add theme and app bootstrap

#### `src/theme.ts`
- create MUI light theme with custom primary/secondary colors

#### `src/main.tsx`
- initialize React root
- wrap app in `ThemeProvider` + `CssBaseline`
- keep `React.StrictMode` enabled

## Run and verify

From `week-9`:

```bash
deno task dev
```
Note that deno may load dependencies from the global cache first, and if this leads to an error, you can try clearing the cache with `deno cache --reload` and re-install the dependencies with `deno add [package]`. They should appear in `node_modules` and `deno.json` after installation.