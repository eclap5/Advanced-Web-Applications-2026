import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { login } from "../api";
import { setToken } from "../auth";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = await login(email, password);
            setToken(token);
            navigate("/notifications");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Paper sx={{ p: 3, maxWidth: 480, mx: "auto" }}>
            <Typography variant="h5" gutterBottom>
                Login
            </Typography>

            <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </Button>
            </Box>
        </Paper>
    );
}