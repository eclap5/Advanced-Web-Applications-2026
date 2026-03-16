import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SearchControls } from "../types";
import LanguageSwitcher from "./LanguageSwitcher";

type Props = {
    controls: SearchControls;
    favoritesCount: number;
    onControlsChange: (next: SearchControls) => void;
};

export default function ControlsBar({
    controls,
    favoritesCount,
    onControlsChange,
}: Readonly<Props>) {
    const { t } = useTranslation();

    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="sort-label">{t("sortBy")}</InputLabel>
                    <Select
                        labelId="sort-label"
                        label={t("sortBy")}
                        value={controls.sortBy}
                        onChange={(e) =>
                            onControlsChange({
                                ...controls,
                                sortBy: e.target.value as "title" | "year",
                            })}
                    >
                        <MenuItem value="title">{t("sortTitle")}</MenuItem>
                        <MenuItem value="year">{t("sortYear")}</MenuItem>
                    </Select>
                </FormControl>

                <LanguageSwitcher />
            </Stack>

            <Typography variant="body1">
                {t("favoritesCount")}: {favoritesCount}
            </Typography>
        </Stack>
    );
}