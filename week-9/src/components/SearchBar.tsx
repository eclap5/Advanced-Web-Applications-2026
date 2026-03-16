import { Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
    query: string;
    onQueryChange: (value: string) => void;
};

export default function SearchBar({ query, onQueryChange }: Readonly<Props>) {
    const { t } = useTranslation();

    return (
        <Stack spacing={2}>
            <Typography variant="h4">{t("appTitle")}</Typography>

            <TextField
                label={t("searchLabel")}
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                fullWidth
            />
        </Stack>
    );
}