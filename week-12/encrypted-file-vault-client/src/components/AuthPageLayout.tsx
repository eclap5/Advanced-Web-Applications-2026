import type { PropsWithChildren } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

type AuthPageLayoutProps = PropsWithChildren<{
    title: string;
    subtitle?: string;
}>;

export function AuthPageLayout({
    title,
    subtitle,
    children,
}: Readonly<AuthPageLayoutProps>) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                bgcolor: "grey.100",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={4} sx={{ p: 4 }}>
                    <Box sx={{ mb: 3, textAlign: "center" }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {title}
                        </Typography>

                        {subtitle && (
                            <Typography variant="body1" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {children}
                </Paper>
            </Container>
        </Box>
    );
}