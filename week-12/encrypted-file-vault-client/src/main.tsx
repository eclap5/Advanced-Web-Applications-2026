import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./providers/AuthProvider";
import { EncryptionKeyProvider } from "./providers/EncryptionKeyProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <EncryptionKeyProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </EncryptionKeyProvider>
        </AuthProvider>
    </React.StrictMode>,
);