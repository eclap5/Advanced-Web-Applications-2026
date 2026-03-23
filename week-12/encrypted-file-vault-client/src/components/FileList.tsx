import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEncryptionKey } from "../hooks/useEncryptionKey";
import { decryptFile } from "../utils/crypto";
import { deleteFileRequest, downloadFileRequest, getFilesRequest } from "../utils/api";
import type { StoredFile } from "../utils/types";

type FileListProps = {
    refreshToken: number;
};

function saveBlobToDisk(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
}

export function FileList({ refreshToken }: Readonly<FileListProps>) {
    const { key, fingerprint, isLoaded } = useEncryptionKey();

    const [files, setFiles] = useState<StoredFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadFiles() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getFilesRequest();
            setFiles(data);
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Failed to load files.";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadFiles();
    }, [refreshToken]);

    async function handleDownload(file: StoredFile) {
        if (!isLoaded || !key || !fingerprint) {
            setErrorMessage("Load your encryption key before downloading files.");
            return;
        }

        setErrorMessage("");
        setDownloadingId(file.id);

        try {
            const response = await downloadFileRequest(file.id, fingerprint);
            const encryptedBuffer = await response.file.arrayBuffer();

            const decryptedBytes = await decryptFile(
                encryptedBuffer,
                key,
                response.encryptionIv || file.encryptionIv,
            );

            // Copy to a fresh buffer before constructing Blob for browser download.
            const blobBuffer = new Uint8Array(decryptedBytes.byteLength);
            blobBuffer.set(decryptedBytes);

            const decryptedBlob = new Blob([blobBuffer.buffer], {
                type: response.contentType || file.contentType,
            });

            saveBlobToDisk(
                decryptedBlob,
                response.originalFilename || file.originalFilename,
            );
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to download file.";
            setErrorMessage(message);
        } finally {
            setDownloadingId(null);
        }
    }

    async function handleDelete(file: StoredFile) {
        if (!isLoaded || !fingerprint) {
            setErrorMessage("Load your encryption key before deleting files.");
            return;
        }

        const shouldDelete = globalThis.confirm(
            `Delete "${file.originalFilename}" permanently?`,
        );

        if (!shouldDelete) {
            return;
        }

        setErrorMessage("");
        setDeletingId(file.id);

        try {
            await deleteFileRequest(file.id, fingerprint);
            setFiles((prevFiles) => prevFiles.filter((item) => item.id !== file.id));
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete file.";
            setErrorMessage(message);
        } finally {
            setDeletingId(null);
        }
    }

    let fileListContent: React.ReactNode;

    if (isLoading) {
        fileListContent = (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 4,
                }}
            >
                <CircularProgress />
            </Box>
        );
    } else if (files.length === 0) {
        fileListContent = (
            <Typography variant="body2" color="text.secondary">
                No files uploaded yet.
            </Typography>
        );
    } else {
        fileListContent = (
            <List disablePadding>
                {files.map((file) => (
                    <ListItem
                        key={file.id}
                        divider
                        secondaryAction={
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => void handleDownload(file)}
                                    disabled={
                                        !isLoaded ||
                                        downloadingId === file.id ||
                                        deletingId === file.id
                                    }
                                >
                                    {downloadingId === file.id
                                        ? "Downloading..."
                                        : "Download"}
                                </Button>

                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => void handleDelete(file)}
                                    disabled={
                                        !isLoaded ||
                                        deletingId === file.id ||
                                        downloadingId === file.id
                                    }
                                >
                                    {deletingId === file.id
                                        ? "Deleting..."
                                        : "Delete"}
                                </Button>
                            </Stack>
                        }
                    >
                        <ListItemText
                            primary={file.originalFilename}
                            secondary={`Size: ${file.sizeBytes} bytes`}
                        />
                    </ListItem>
                ))}
            </List>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Your files
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Downloaded files are decrypted in the browser using
                            your loaded encryption key.
                        </Typography>
                    </Box>

                    {!isLoaded && (
                        <Alert severity="warning">
                            Load your encryption key before managing files.
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}

                    {fileListContent}
                </Stack>
            </CardContent>
        </Card>
    );
}