import { useEffect, useState } from "react";
import {
    Alert,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchNotifications } from "../api";
import { clearToken } from "../auth";
import type { Notification } from "../types";

export default function NotificationsPage() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchNotifications();
                setNotifications(data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Failed to load notifications";

                if (msg === "UNAUTHORIZED") {
                    clearToken();
                    navigate("/login", { replace: true });
                    return;
                }

                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [navigate]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Stack spacing={2}>
            <Typography variant="h4">Notifications</Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {notifications.map((notification) => (
                <Card key={notification.id}>
                    <CardContent>
                        <Typography variant="h6">
                            {notification.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            {notification.content}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
                            {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}