import { useState, useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { AuthPageLayout } from "../components/AuthPageLayout";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message || "";
    const from = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (successMessage) {
            globalThis.history.replaceState({}, document.title);
        }
    }, [successMessage]);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Login failed.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthPageLayout
            title="Login"
            subtitle="Sign in to access your encrypted file vault."
        >
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success">{successMessage}</Alert>
                    )}

                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        fullWidth
                        autoComplete="email"
                    />

                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        fullWidth
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            "Login"
                        )}
                    </Button>

                    <Typography variant="body2" textAlign="center">
                        Don&apos;t have an account?{" "}
                        <Link component={RouterLink} to="/register">
                            Register here
                        </Link>
                    </Typography>
                </Stack>
            </Box>
        </AuthPageLayout>
    );
}