import {
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
};

export default function FavoritesPanel({ favorites }: Readonly<Props>) {
    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
                <Typography variant="h6">Favorites</Typography>

                <Divider />

                {favorites.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No favorites yet.
                    </Typography>
                ) : (
                    <List dense>
                        {favorites.map((book) => (
                            <ListItem key={book.key} disablePadding>
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