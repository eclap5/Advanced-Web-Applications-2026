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
import { register } from "../api";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await register(email, password);
            setSuccess("Registration successful. You can now log in.");
            navigate("/login");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Paper sx={{ p: 3, maxWidth: 480, mx: "auto" }}>
            <Typography variant="h5" gutterBottom>
                Register
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
                    helperText="At least 8 characters, one uppercase, one number, one special character"
                    fullWidth
                />

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </Button>
            </Box>
        </Paper>
    );
}