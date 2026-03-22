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

    const binaryString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte)
    ).join("");

    return btoa(binaryString);
}

export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
    const normalizedBase64 = base64Key.replaceAll(/\s+/g, "");
    const binary = atob(normalizedBase64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        const cp = binary.codePointAt(i);

        if (cp === undefined) {
            throw new Error("Invalid base64 key data");
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

export type EncryptedFileResult = {
    encryptedBytes: Uint8Array;
    ivBase64: string;
    algorithm: "AES-GCM";
    originalFilename: string;
    contentType: string;
    sizeBytes: number;
};

export async function encryptFile(
    file: File,
    key: CryptoKey,
): Promise<EncryptedFileResult> {
    const fileBuffer = await file.arrayBuffer();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        fileBuffer,
    );

    const ivBinary = Array.from(iv, (byte) =>
        String.fromCodePoint(byte)
    ).join("");

    return {
        encryptedBytes: new Uint8Array(encryptedBuffer),
        ivBase64: btoa(ivBinary),
        algorithm: "AES-GCM",
        originalFilename: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
    };
}

export async function decryptFile(
    encryptedBytes: ArrayBuffer,
    key: CryptoKey,
    ivBase64: string,
): Promise<Uint8Array> {
    const ivBinary = atob(ivBase64);
    const iv = new Uint8Array(ivBinary.length);

    for (let i = 0; i < ivBinary.length; i++) {
        const cp = ivBinary.codePointAt(i);

        if (cp === undefined) {
            throw new Error("Invalid IV data");
        }
        iv[i] = cp;
    }

    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        encryptedBytes,
    );

    return new Uint8Array(decryptedBuffer);
}