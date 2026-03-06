import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { createNotification } from "../api";

export default function AdminNewNotificationPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await createNotification({ title, content });
            setTitle("");
            setContent("");
            setSuccess("Notification created");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to create notification");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Create Notification
            </Typography>

            <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
                <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    minRows={4}
                    fullWidth
                />

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Saving..." : "Create"}
                </Button>
            </Box>
        </Paper>
    );
}