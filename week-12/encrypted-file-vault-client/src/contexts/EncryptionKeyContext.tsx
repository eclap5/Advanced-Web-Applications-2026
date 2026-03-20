import { createContext } from "react";

export type EncryptionKeyContextValue = {
    key: CryptoKey | null;
    fingerprint: string | null;
    base64Key: string;
    isLoaded: boolean;
    loadKey: (base64Key: string) => Promise<void>;
    clearKey: () => void;
};

export const EncryptionKeyContext = createContext<EncryptionKeyContextValue | undefined>(undefined);