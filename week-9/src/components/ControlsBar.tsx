import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import type { SearchControls } from "../types";

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
    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="sort-label">Sort by</InputLabel>
                    <Select
                        labelId="sort-label"
                        label="Sort by"
                        value={controls.sortBy}
                        onChange={(e) =>
                            onControlsChange({
                                ...controls,
                                sortBy: e.target.value,
                            })}
                    >
                        <MenuItem value="title">Title</MenuItem>
                        <MenuItem value="year">First publish year</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <Typography variant="body1">
                Favorites: {favoritesCount}
            </Typography>
        </Stack>
    );
}