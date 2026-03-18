import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { fetchMe, logout, type UserProfile } from "../api";

export default function ProfilePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchMe()
            .then(setUser)
            .catch(() => navigate("/", { replace: true }));
    }, [navigate]);

    async function handleLogout() {
        await logout();
        navigate("/", { replace: true });
    }

    if (!user) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography>{t("loading")}</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Stack spacing={3}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <LanguageSwitcher />
                </Box>

                <Paper sx={{ p: 4 }}>
                    <Stack spacing={3} alignItems="center">
                        <Typography variant="h4">{t("profileTitle")}</Typography>

                        <Avatar
                            src={user.picture}
                            alt={user.name}
                            sx={{ width: 96, height: 96 }}
                        />

                        <Typography variant="h5">
                            {t("welcome")}, {user.name}
                        </Typography>

                        <Stack spacing={1} sx={{ width: "100%" }}>
                            <Typography>
                                <strong>{t("email")}:</strong> {user.email}
                            </Typography>

                            <Typography>
                                <strong>{t("googleId")}:</strong> {user.sub}
                            </Typography>
                        </Stack>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleLogout}
                        >
                            {t("logout")}
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}