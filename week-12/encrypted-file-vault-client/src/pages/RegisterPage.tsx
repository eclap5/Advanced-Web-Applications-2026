import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
import { useAuth } from "../hooks/useAuth.ts";

export function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await register({
                email,
                password,
                inviteCode,
            });

            navigate("/login", { 
                replace: true,
                state: {
                    message: "Registration successful. Please log in.",
                },
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Registration failed.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthPageLayout
            title="Register"
            subtitle="Create an account using the course invitation code."
        >
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
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
                        autoComplete="new-password"
                    />

                    <TextField
                        label="Invitation code"
                        value={inviteCode}
                        onChange={(event) => setInviteCode(event.target.value)}
                        required
                        fullWidth
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
                            "Register"
                        )}
                    </Button>

                    <Typography variant="body2" textAlign="center">
                        Already have an account?{" "}
                        <Link component={RouterLink} to="/login">
                            Login here
                        </Link>
                    </Typography>
                </Stack>
            </Box>
        </AuthPageLayout>
    );
}