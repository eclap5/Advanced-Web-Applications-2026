import { useState } from "react";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Stack,
    Typography,
} from "@mui/material";
import { getCoverUrl } from "../api";
import type { Book } from "../types";

type Props = {
    book: Book;
    isFavorite: boolean;
    onToggleFavorite: (book: Book) => void;
};

export default function BookCard({
    book,
    isFavorite,
    onToggleFavorite,
}: Readonly<Props>) {
    const initialCoverUrl = getCoverUrl(book.coverId);
    const [coverUrl, setCoverUrl] = useState(initialCoverUrl);

    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {coverUrl ? (
                <CardMedia
                    component="img"
                    height="220"
                    image={coverUrl}
                    alt={book.title}
                    onError={() => setCoverUrl(null)}
                />
            ) : (
                <Stack
                    sx={{
                        height: 220,
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.100",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        No cover image
                    </Typography>
                </Stack>
            )}

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                    {book.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {book.authorName.join(", ")}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                    First published: {book.firstPublishYear ?? "Unknown"}
                </Typography>

                <Typography variant="body2">
                    Editions: {book.editionCount}
                </Typography>
            </CardContent>

            <CardActions>
                <Button onClick={() => onToggleFavorite(book)}>
                    {isFavorite ? "Remove favorite" : "Add favorite"}
                </Button>
            </CardActions>
        </Card>
    );
}