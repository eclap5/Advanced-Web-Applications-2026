export async function generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"],
    );
}

export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const bytes = new Uint8Array(rawKey);

    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCodePoint(byte);
    }

    return btoa(binary);
}

export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
    const normalizedBase64 = base64Key.replaceAll(/\s+/g, "");
    const binary = atob(normalizedBase64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        const cp = binary.codePointAt(i);
        if (cp === undefined) {
            throw new Error("Invalid base64 key: contains non-ASCII characters.");
        }
        bytes[i] = cp;
    }

    if (bytes.length !== 32) {
        throw new Error("Invalid key length. Expected a 256-bit AES key.");
    }

    return await crypto.subtle.importKey(
        "raw",
        bytes.buffer,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"],
    );
}

export async function createKeyFingerprint(key: CryptoKey): Promise<string> {
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", rawKey);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}