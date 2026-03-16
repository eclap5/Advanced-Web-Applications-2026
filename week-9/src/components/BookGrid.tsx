import { Grid } from "@mui/material";
import type { Book } from "../types";
import BookCard from "./BookCard";

type Props = {
    books: Book[];
    favorites: Book[];
    onToggleFavorite: (book: Book) => void;
};

export default function BookGrid({
    books,
    favorites,
    onToggleFavorite,
}: Readonly<Props>) {
    return (
        <Grid container spacing={2}>
            {books.map((book) => {
                const isFavorite = favorites.some((favorite) => favorite.key === book.key);

                return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.key}>
                        <BookCard
                            book={book}
                            isFavorite={isFavorite}
                            onToggleFavorite={onToggleFavorite}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
}