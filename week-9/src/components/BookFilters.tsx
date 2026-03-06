import {
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
} from "@mui/material";
import type { SearchFilters } from "../types";

type Props = {
    filters: SearchFilters;
    onFiltersChange: (next: SearchFilters) => void;
};

export default function BookFilters({ filters, onFiltersChange }: Readonly<Props>) {
    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mt: 2 }}
        >
            <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                    labelId="language-label"
                    label="Language"
                    value={filters.language}
                    onChange={(e) =>
                        onFiltersChange({
                            ...filters,
                            language: e.target.value,
                        })}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="eng">English</MenuItem>
                    <MenuItem value="fin">Finnish</MenuItem>
                    <MenuItem value="ger">German</MenuItem>
                    <MenuItem value="fre">French</MenuItem>
                    <MenuItem value="spa">Spanish</MenuItem>
                </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="sort-label">Sort by</InputLabel>
                <Select
                    labelId="sort-label"
                    label="Sort by"
                    value={filters.sortBy}
                    onChange={(e) =>
                        onFiltersChange({
                            ...filters,
                            sortBy: e.target.value as "title" | "year",
                        })}
                >
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="year">First publish year</MenuItem>
                </Select>
            </FormControl>

            <FormControlLabel
                control={(
                    <Switch
                        checked={filters.favoritesOnly}
                        onChange={(e) =>
                            onFiltersChange({
                                ...filters,
                                favoritesOnly: e.target.checked,
                            })}
                    />
                )}
                label="Favorites only"
            />
        </Stack>
    );
}