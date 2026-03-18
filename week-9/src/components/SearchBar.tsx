import { Stack, TextField, Typography } from "@mui/material";

type Props = {
    query: string;
    onQueryChange: (value: string) => void;
};

export default function SearchBar({ query, onQueryChange }: Readonly<Props>) {
    return (
        <Stack spacing={2}>
            <Typography variant="h4">Book Explorer</Typography>

            <TextField
                label="Search books"
                placeholder="Type a title, author, or keyword..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                fullWidth
            />
        </Stack>
    );
}