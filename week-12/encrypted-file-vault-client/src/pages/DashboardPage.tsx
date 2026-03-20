import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { KeyManager } from "../components/KeyManager";

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
                            Manage your client-side encryption key and encrypted files.
                        </Typography>
                    </Box>

                    <KeyManager />

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Upload file
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                This section will later contain the encrypted file
                                upload form.
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Your files
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                This section will later display files owned by the
                                currently logged-in user.
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}