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
import { useTranslation } from "react-i18next";
import type { Book } from "../types";

type Props = {
    favorites: Book[];
    onRemoveFavorite: (book: Book) => void;
};

export default function FavoritesPanel({
    favorites,
    onRemoveFavorite,
}: Readonly<Props>) {
    const { t } = useTranslation();

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
                <Typography variant="h6">{t("favorites")}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {t("storedLocally")}
                </Typography>

                <Divider />

                {favorites.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        {t("noFavorites")}
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
                                        {t("remove")}
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