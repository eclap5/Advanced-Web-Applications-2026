import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export function PublicOnlyRoute({ children }: Readonly<PropsWithChildren>) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (isAuthenticated && user) {
        if (user.hasEncryptionKey) {
            return <Navigate to="/" replace />;
        }

        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
}