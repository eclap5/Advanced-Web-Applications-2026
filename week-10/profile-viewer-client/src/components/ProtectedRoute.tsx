import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { fetchMe } from "../api";

type Props = {
    children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Readonly<Props>) {
    const [status, setStatus] = useState<"loading" | "ok" | "unauthorized">(
        "loading",
    );

    useEffect(() => {
        fetchMe()
            .then(() => setStatus("ok"))
            .catch(() => setStatus("unauthorized"));
    }, []);

    if (status === "loading") {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (status === "unauthorized") {
        return <Navigate to="/" replace />;
    }

    return children;
}