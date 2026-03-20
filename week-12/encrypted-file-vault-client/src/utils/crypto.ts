export async function generateEncryptionKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const uint8Array = new Uint8Array(rawKey);
    let binaryString = "";
    for (let i = 0; i < uint8Array.byteLength; i++) {
        binaryString += String.fromCodePoint(uint8Array[i]);
    }
    return btoa(binaryString);
}

export async function createKeyFingerprint(key: CryptoKey): Promise<string> {
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", rawKey);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
    const binaryString = atob(base64Key);
    const uint8Array = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        const cp = binaryString.codePointAt(i);
        if (cp === undefined) {
            throw new Error("Failed to decode base64 string.");
        }
        uint8Array[i] = cp;
    }

    return await crypto.subtle.importKey(
        "raw",
        uint8Array,
        { 
            name: "AES-GCM" 
        },
        false,
        ["encrypt", "decrypt"]
    );
}