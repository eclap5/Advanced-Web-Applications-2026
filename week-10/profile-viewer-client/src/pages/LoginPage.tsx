import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const BACKEND_URL = "http://localhost:8000";

function signIn() {
    globalThis.location.href = `${BACKEND_URL}/auth/google/login`;
}

export default function LoginPage() {
    const { t } = useTranslation();

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Stack spacing={3}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <LanguageSwitcher />
                </Box>

                <Paper sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Typography variant="h4">{t("appTitle")}</Typography>

                        <Box>
                            <Typography variant="h5" gutterBottom>
                                {t("signInTitle")}
                            </Typography>

                            <Typography color="text.secondary">
                                {t("signInDescription")}
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={signIn}
                        >
                            {t("signInButton")}
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}