import {
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import type { Book } from "../types";

type Props = {
    favorites: Book[];
    onRemoveFavorite: (book: Book) => void;
};

export default function FavoritesPanel({
    favorites,
    onRemoveFavorite,
}: Readonly<Props>) {
    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
                <Typography variant="h6">Favorites</Typography>
                <Typography variant="body2" color="text.secondary">
                    Stored locally in the browser.
                </Typography>

                <Divider />

                {favorites.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No favorites yet.
                    </Typography>
                ) : (
                    <List dense>
                        {favorites.map((book) => (
                            <ListItem
                                key={book.key}
                                disableGutters
                                secondaryAction={(
                                    <Button
                                        size="small"
                                        onClick={() => onRemoveFavorite(book)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            >
                                <ListItemText
                                    primary={book.title}
                                    secondary={book.authorName.join(", ")}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Stack>
        </Paper>
    );
}