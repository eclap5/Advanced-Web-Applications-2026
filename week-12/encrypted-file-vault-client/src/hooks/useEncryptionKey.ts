import { useContext } from "react";
import { EncryptionKeyContext } from "../contexts/EncryptionKeyContext.tsx";

export function useEncryptionKey() {
    const context = useContext(EncryptionKeyContext);

    if (!context) {
        throw new Error(
            "useEncryptionKey must be used inside an EncryptionKeyProvider.",
        );
    }

    return context;
}