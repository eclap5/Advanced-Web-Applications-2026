import {
    useCallback,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    createKeyFingerprint,
    importKeyFromBase64,
} from "../utils/crypto.ts";
import { EncryptionKeyContext, type EncryptionKeyContextValue } from "../contexts/EncryptionKeyContext.tsx";

type EncryptionKeyProviderProps = {
    children: ReactNode;
};

export function EncryptionKeyProvider({
    children,
}: Readonly<EncryptionKeyProviderProps>) {
    const [key, setKey] = useState<CryptoKey | null>(null);
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [base64Key, setBase64Key] = useState("");

    const loadKey = useCallback(async (rawBase64Key: string) => {
        const trimmedKey = rawBase64Key.trim();

        if (!trimmedKey) {
            throw new Error("Encryption key is required.");
        }

        const importedKey = await importKeyFromBase64(trimmedKey);
        const computedFingerprint = await createKeyFingerprint(importedKey);

        setKey(importedKey);
        setFingerprint(computedFingerprint);
        setBase64Key(trimmedKey);
    }, []);

    const clearKey = useCallback(() => {
        setKey(null);
        setFingerprint(null);
        setBase64Key("");
    }, []);

    const value = useMemo<EncryptionKeyContextValue>(() => {
        return {
            key,
            fingerprint,
            base64Key,
            isLoaded: Boolean(key && fingerprint),
            loadKey,
            clearKey,
        };
    }, [key, fingerprint, base64Key, loadKey, clearKey]);

    return (
        <EncryptionKeyContext.Provider value={value}>
            {children}
        </EncryptionKeyContext.Provider>
    );
}