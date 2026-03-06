import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { clearToken, isAdmin, isLoggedIn } from "../auth";

type Props = {
    children: React.ReactNode;
};

// This is the main layout component for the app. It includes the navigation bar and renders the child components in the main content area.
// This is a practical way to demonstrate the use of Material UI components and React Router for navigation.
// Note that Links guarded with isAdmin are not visible to normal authenticated users.
export default function AppLayout({ children }: Readonly<Props>) {
    const navigate = useNavigate();

    function logout() {
        clearToken();
        navigate("/login");
    }

    return (
        <Box>
            <AppBar position="static">
                <Toolbar sx={{ gap: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Community Notice Board
                    </Typography>

                    {isLoggedIn() && (
                        <Button color="inherit" component={RouterLink} to="/notifications">
                            Notifications
                        </Button>
                    )}

                    {isAdmin() && (
                        <Button color="inherit" component={RouterLink} to="/admin/notifications/new">
                            New notification
                        </Button>
                    )}

                    {isAdmin() && (
                        <Button color="inherit" component={RouterLink} to="/admin/users">
                            Users
                        </Button>
                    )}

                    {!isLoggedIn() && (
                        <Button color="inherit" component={RouterLink} to="/login">
                            Login
                        </Button>
                    )}

                    {!isLoggedIn() && (
                        <Button color="inherit" component={RouterLink} to="/register">
                            Register
                        </Button>
                    )}

                    {isLoggedIn() && (
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
                {children}
            </Box>
        </Box>
    );
}