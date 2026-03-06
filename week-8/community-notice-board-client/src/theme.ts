import { createTheme } from "@mui/material/styles";

// Material UI provides a theming system that allows you to customize the theme applying to the entire application.
export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#9c27b0",
        },
    },
});