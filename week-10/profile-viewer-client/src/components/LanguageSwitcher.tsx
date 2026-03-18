import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
    const { i18n, t } = useTranslation();

    return (
        <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="language-switcher-label">{t("language")}</InputLabel>
            <Select
                labelId="language-switcher-label"
                label={t("language")}
                value={i18n.language}
                onChange={(e) => void i18n.changeLanguage(e.target.value)}
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fi">Suomi</MenuItem>
            </Select>
        </FormControl>
    );
}