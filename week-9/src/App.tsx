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
import { useTranslation } from "react-i18next";
import type { Book, SearchControls } from "./types";
import { useBookSearch } from "./hooks/useBookSearch";
import { useLocalStorage } from "./hooks/useLocalStorage";
import SearchBar from "./components/SearchBar";
import ControlsBar from "./components/ControlsBar";
import BookGrid from "./components/BookGrid";
import FavoritesPanel from "./components/FavoritesPanel";

const INITIAL_CONTROLS: SearchControls = {
    sortBy: "title"
};

export default function App() {
    const { t } = useTranslation();

    const [query, setQuery] = useState("");
    const [controls, setControls] = useState<SearchControls>(INITIAL_CONTROLS);
    const [favorites, setFavorites] = useLocalStorage<Book[]>(
        "book-explorer-favorites",
        [],
    );      // Note that every time user sets a new favorite book, the useEffect dependency in useLocalStorage will trigger and update the localStorage with the new favorites list.

    const { books, loading, error } = useBookSearch(query);

    // Sort and filter books based on the current controls using useMemo to avoid unnecessary computations on every render. The visibleBooks will only be recalculated when the books or controls change.
    const visibleBooks = useMemo(() => {
        const result = [...books];

        if (controls.sortBy === "title") {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        if (controls.sortBy === "year") {
            result.sort(
                (a, b) => (b.firstPublishYear ?? 0) - (a.firstPublishYear ?? 0),
            );
        }

        return result;
    }, [books, controls]);

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
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <ControlsBar
                        controls={controls}
                        favoritesCount={favorites.length}
                        onControlsChange={setControls}
                    />
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                        {t("results")}: {visibleBooks.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("sourceInfo")}
                    </Typography>
                </Paper>

                <Box 
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" },
                        gap: 3,
                    }}>

                    <FavoritesPanel favorites={favorites} onRemoveFavorite={toggleFavorite} />

                    {query.trim().length < 2 ? (
                        <Paper sx={{ p: 3 }}>
                            <Typography color="text.secondary">
                                {t("searchHint")}
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
                </Box>
            </Stack>
        </Container>
    );
}