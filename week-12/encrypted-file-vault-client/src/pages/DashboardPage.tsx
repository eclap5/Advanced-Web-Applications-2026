import {
    AppBar,
    Box,
    Button,
    Container,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { KeyManager } from "../components/KeyManager";
import { FileUploadForm } from "../components/FileUploadForm";
import { FileList } from "../components/FileList";

export function DashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
            <AppBar position="static">
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" component="div">
                        Encrypted File Vault
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2">
                            {user?.email ?? "Unknown user"}
                        </Typography>

                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Dashboard
                        </Typography>

                        <Typography variant="body1" color="text.secondary">
                            Manage your session key and encrypted file storage.
                        </Typography>
                    </Box>

                    <KeyManager />
                    <FileUploadForm onUploadSuccess={() => globalThis.location.reload()} />
                    <FileList />
                </Stack>
            </Container>
        </Box>
    );
}