import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Container,
    FormControlLabel,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyIcon from "@mui/icons-material/Key";
import { useAuth } from "../hooks/useAuth.ts";
import { setEncryptionKeyFingerprintRequest } from "../utils/api";
import {
    createKeyFingerprint,
    exportKeyToBase64,
    generateEncryptionKey,
} from "../utils/crypto";

export function OnboardingPage() {
    const navigate = useNavigate();
    const { refreshCurrentUser } = useAuth();

    const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
    const [generatedKey, setGeneratedKey] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleGenerateKey() {
        setErrorMessage("");
        setSuccessMessage("");
        setHasConfirmedBackup(false);
        setIsGenerating(true);

        try {
            const cryptoKey: CryptoKey = await generateEncryptionKey();
            const exportedKey: string = await exportKeyToBase64(cryptoKey);

            setGeneratedKey(exportedKey);
            setCryptoKey(cryptoKey);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to generate encryption key.";
            setErrorMessage(message);
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleCopyKey() {
        if (!generatedKey) {
            return;
        }

        try {
            await navigator.clipboard.writeText(generatedKey);
            setSuccessMessage("Encryption key copied to clipboard.");
        } catch {
            setErrorMessage("Failed to copy key to clipboard.");
        }
    }

    async function handleContinue() {
        if (!generatedKey) {
            setErrorMessage("Generate an encryption key before continuing.");
            return;
        }

        if (!hasConfirmedBackup) {
            setErrorMessage("Confirm that you have stored the key safely.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);

        try {
            if (!cryptoKey) {
                throw new Error("CryptoKey is not available.");
            }
            const fingerprint: string = await createKeyFingerprint(cryptoKey);

            await setEncryptionKeyFingerprintRequest(fingerprint);
            await refreshCurrentUser();

            navigate("/", { replace: true });
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to complete onboarding.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                bgcolor: "grey.100",
                py: 4,
            }}
        >
            <Container maxWidth="md">
                <Paper elevation={4} sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                gutterBottom
                            >
                                Set up your encryption key
                            </Typography>

                            <Typography variant="body1" color="text.secondary">
                                Before using the application, you must create
                                your personal encryption key. Files will be
                                encrypted in your browser before they are sent
                                to the server.
                            </Typography>
                        </Box>

                        <Alert severity="warning">
                            The server does not store your encryption key. If
                            you lose it, your uploaded files cannot be
                            decrypted.
                        </Alert>

                        <Paper
                            variant="outlined"
                            sx={{ p: 3, bgcolor: "grey.50" }}
                        >
                            <Stack spacing={2}>
                                <Typography variant="h6">
                                    How this works
                                </Typography>

                                <Typography variant="body2">
                                    1. A cryptographic key is generated in your
                                    browser.
                                </Typography>

                                <Typography variant="body2">
                                    2. You must store that key safely.
                                </Typography>

                                <Typography variant="body2">
                                    3. Only a fingerprint of the key is sent to
                                    the server for verification.
                                </Typography>

                                <Typography variant="body2">
                                    4. The key itself stays under your control.
                                </Typography>
                            </Stack>
                        </Paper>

                        {errorMessage && (
                            <Alert severity="error">{errorMessage}</Alert>
                        )}

                        {successMessage && (
                            <Alert severity="success">
                                {successMessage}
                            </Alert>
                        )}

                        <Stack spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<KeyIcon />}
                                onClick={handleGenerateKey}
                                disabled={isGenerating || isSubmitting}
                            >
                                {isGenerating ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    "Generate encryption key"
                                )}
                            </Button>

                            <TextField
                                label="Generated encryption key"
                                value={generatedKey}
                                multiline
                                minRows={3}
                                fullWidth
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                                placeholder="Generate a key to continue"
                            />

                            <Button
                                variant="outlined"
                                startIcon={<ContentCopyIcon />}
                                onClick={handleCopyKey}
                                disabled={!generatedKey || isSubmitting}
                            >
                                Copy key
                            </Button>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={hasConfirmedBackup}
                                        onChange={(event) =>
                                            setHasConfirmedBackup(
                                                event.target.checked,
                                            )}
                                    />
                                }
                                label="I have copied and stored the encryption key safely."
                            />
                        </Stack>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleContinue}
                                disabled={
                                    !generatedKey ||
                                    !hasConfirmedBackup ||
                                    isSubmitting
                                }
                            >
                                {isSubmitting ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    "Continue to dashboard"
                                )}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}