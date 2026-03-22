import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useEncryptionKey } from "../hooks/useEncryptionKey";
import { encryptFile } from "../utils/crypto";
import { uploadFileRequest } from "../utils/api";

type FileUploadFormProps = {
    onUploadSuccess: () => Promise<void> | void;
};

export function FileUploadForm({
    onUploadSuccess,
}: Readonly<FileUploadFormProps>) {
    const { key, fingerprint, isLoaded } = useEncryptionKey();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!selectedFile) {
            setErrorMessage("Select a file before uploading.");
            return;
        }

        if (!isLoaded || !key || !fingerprint) {
            setErrorMessage("Load your encryption key before uploading files.");
            return;
        }

        setIsSubmitting(true);

        try {
            const encryptedFile = await encryptFile(selectedFile, key);

            await uploadFileRequest({
                encryptedBytes: encryptedFile.encryptedBytes,
                originalFilename: encryptedFile.originalFilename,
                contentType: encryptedFile.contentType,
                sizeBytes: encryptedFile.sizeBytes,
                encryptionAlgorithm: encryptedFile.algorithm,
                encryptionIv: encryptedFile.ivBase64,
                fingerprint,
            });

            setSuccessMessage("File encrypted and uploaded successfully.");
            setSelectedFile(null);
            await onUploadSuccess();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "File upload failed.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardContent>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Upload file
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Files are encrypted in the browser before being sent
                            to the server and stored in cloud storage.
                        </Typography>
                    </Box>

                    {!isLoaded && (
                        <Alert severity="warning">
                            Load your encryption key before uploading files.
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success">{successMessage}</Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <Stack spacing={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                disabled={isSubmitting}
                            >
                                {selectedFile
                                    ? `Selected: ${selectedFile.name}`
                                    : "Choose file"}
                                <input
                                    hidden
                                    type="file"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] || null;
                                        setSelectedFile(file);
                                    }}
                                />
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<UploadFileIcon />}
                                disabled={!selectedFile || !isLoaded || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Encrypt and upload"
                                )}
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}