import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import type { Book, SearchFilters } from "./types";
import { useBookSearch } from "./hooks/useBookSearch";
import { useLocalStorage } from "./hooks/useLocalStorage";
import SearchBar from "./components/SearchBar";
import BookFilters from "./components/BookFilters";
import BookGrid from "./components/BookGrid";
import FavoritesPanel from "./components/FavoritesPanel";

const INITIAL_FILTERS: SearchFilters = {
    language: "all",
    sortBy: "title",
    favoritesOnly: false,
};

export default function App() {
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
    const [favorites, setFavorites] = useLocalStorage<Book[]>(
        "book-explorer-favorites",
        [],
    );      // Note that every time user sets a new favorite book, the useEffect dependency in useLocalStorage will trigger and update the localStorage with the new favorites list.

    const { books, loading, error } = useBookSearch(query);

    // Apply client-side filters and sorting to the search results
    // This is memoized to avoid unnecessary recalculations on every render by caching the result and only recomputing it when the dependencies (books, favorites, filters) change.
    const visibleBooks = useMemo(() => {
        let result = [...books];

        if (filters.language !== "all") {
            result = result.filter((book) =>
                book.language.includes(filters.language)
            );
        }

        if (filters.favoritesOnly) {
            result = result.filter((book) =>
                favorites.some((favorite) => favorite.key === book.key)
            );
        }

        if (filters.sortBy === "title") {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        if (filters.sortBy === "year") {
            result.sort(
                (a, b) => (b.firstPublishYear ?? 0) - (a.firstPublishYear ?? 0),
            );
        }

        return result;
    }, [books, favorites, filters]);

    // Toggle a book as favorite/unfavorite
    function toggleFavorite(book: Book) {
        setFavorites((prev) => {
            const exists = prev.some((item) => item.key === book.key);

            if (exists) {
                return prev.filter((item) => item.key !== book.key);
            }

            return [...prev, book];
        });
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Paper sx={{ p: 3 }}>
                    <SearchBar query={query} onQueryChange={setQuery} />
                    <BookFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </Paper>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" },
                        gap: 3,
                    }}
                >
                    <FavoritesPanel favorites={favorites} />

                    <Stack spacing={2}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1">
                                Results: {visibleBooks.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Search results are fetched from Open Library.
                            </Typography>
                        </Paper>

                        {query.trim().length < 2 ? (
                            <Paper sx={{ p: 3 }}>
                                <Typography color="text.secondary">
                                    Type at least 2 characters to search books.
                                </Typography>
                            </Paper>
                        ) : null}

                        {loading ? (
                            <Paper sx={{ p: 4, textAlign: "center" }}>
                                <CircularProgress />
                            </Paper>
                        ) : null}

                        {error ? <Alert severity="error">{error}</Alert> : null}

                        {!loading && !error && query.trim().length >= 2 ? (
                            <BookGrid
                                books={visibleBooks}
                                favorites={favorites}
                                onToggleFavorite={toggleFavorite}
                            />
                        ) : null}
                    </Stack>
                </Box>
            </Stack>
        </Container>
    );
}