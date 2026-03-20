import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth.ts";

export function OnboardingRoute({ children }: Readonly<PropsWithChildren>) {
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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.hasEncryptionKey) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}