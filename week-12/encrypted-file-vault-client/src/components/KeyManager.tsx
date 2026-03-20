import { useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEncryptionKey } from "../hooks/useEncryptionKey";

export function KeyManager() {
    const { key, fingerprint, isLoaded, loadKey, clearKey } = useEncryptionKey();
    const fingerprintSelectionRef = useRef<HTMLInputElement | null>(null);

    const [inputValue, setInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

async function handleLoadKey() {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
        await loadKey(inputValue);
        setSuccessMessage("Encryption key loaded for this session.");
        setInputValue("");
    } catch (error: unknown) {
        console.error("Failed to load encryption key:", error);

        const message =
            error instanceof Error
                ? error.message
                : "Failed to load encryption key.";

        setErrorMessage(message);
    } finally {
        setIsSubmitting(false);
    }
}

    function handleClearKey() {
        clearKey();
        setInputValue("");
        setErrorMessage("");
        setSuccessMessage("Encryption key cleared from this session.");
    }

    async function handleSelectFingerprint() {
        if (!fingerprint) {
            return;
        }

        try {
            await navigator.clipboard.writeText(fingerprint);
            setErrorMessage("");
            setSuccessMessage("Fingerprint copied to clipboard.");
            return;
        } catch {
            // Fallback to manual selection when clipboard access is unavailable.
        }

        const selectionInput = fingerprintSelectionRef.current;

        if (!selectionInput) {
            setErrorMessage("Failed to copy fingerprint.");
            return;
        }

        selectionInput.focus();
        selectionInput.select();
        setErrorMessage("");
        setSuccessMessage("Fingerprint selected. Press Ctrl+C to copy.");
    }

    return (
        <Card>
            <CardContent>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Encryption key
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Paste your saved Base64 encryption key to enable file
                            encryption and decryption in this session.
                        </Typography>
                    </Box>

                    <Alert severity="info">
                        The encryption key is kept only in the current browser
                        session. The server does not store it.
                    </Alert>

                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success">{successMessage}</Alert>
                    )}

                    <TextField
                        label="Encryption key"
                        placeholder="Paste your Base64 encryption key here"
                        multiline
                        minRows={3}
                        fullWidth
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        disabled={isSubmitting}
                    />

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<VpnKeyIcon />}
                            onClick={handleLoadKey}
                            disabled={!inputValue.trim() || isSubmitting}
                        >
                            Load key
                        </Button>

                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={handleClearKey}
                            disabled={!isLoaded || isSubmitting}
                        >
                            Clear key
                        </Button>
                    </Stack>

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Session status
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                            <Chip
                                label={isLoaded ? "Key loaded" : "No key loaded"}
                                color={isLoaded ? "success" : "default"}
                            />

                            {fingerprint && (
                                <Tooltip title={`Fingerprint: ${fingerprint}`}>
                                    <Chip
                                        label={`Fingerprint: ${fingerprint.slice(0, 12)}...`}
                                        variant="outlined"
                                        onClick={handleSelectFingerprint}
                                        clickable
                                    />
                                </Tooltip>
                            )}
                        </Stack>
                    </Box>

                    {fingerprint && (
                        <input
                            ref={fingerprintSelectionRef}
                            value={fingerprint}
                            readOnly
                            aria-hidden="true"
                            tabIndex={-1}
                            style={{
                                position: "absolute",
                                opacity: 0,
                                pointerEvents: "none",
                                width: 1,
                                height: 1,
                            }}
                        />
                    )}

                    {key && (
                        <Typography variant="caption" color="text.secondary">
                            A valid encryption key is available for this browser
                            session.
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}