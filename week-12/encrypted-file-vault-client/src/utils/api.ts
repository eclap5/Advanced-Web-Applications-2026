import { getToken } from "./auth";
import type { DownloadFileResponse, LoginCredentials, LoginResponse, RegisterCredentials, StoredFile, UploadFileResponse, User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginRequest(
    credentials: LoginCredentials,
): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const data = await response.json() ?? null;
        const errorText = data?.error?.message;

        throw new Error(errorText || "Login failed.");
    }

    const result = await response.json();

    return result.data;
}

export async function registerRequest(
    credentials: RegisterCredentials,
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const data = await response.json() ?? null;
        const errorText = data?.error?.message;
        
        throw new Error(errorText || "Registration failed.");
    }
}

export async function getCurrentUserRequest(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/dashboard`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch current user.");
    }

    const result = await response.json();

    return result.data;
}

export async function setEncryptionKeyFingerprintRequest(fingerprint: string): Promise<void> {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No authentication token found.");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/onboarding`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ encryptionKeyFingerprint: fingerprint }),
    });

    if (!response.ok) {
        const data = await response.json() ?? null;
        const errorText = data?.error?.message;
        throw new Error(errorText || "Failed to save encryption key fingerprint.");
    }
}

export async function getFilesRequest(): Promise<StoredFile[]> {
    const token = getToken();

    if (!token) {
        throw new Error("User is not authenticated.");
    }

    const response = await fetch(`${API_BASE_URL}/api/files`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to fetch files.");
    }

    return result.data;
}

export async function uploadFileRequest(params: {
    encryptedBytes: Uint8Array;
    originalFilename: string;
    contentType: string;
    sizeBytes: number;
    encryptionAlgorithm: string;
    encryptionIv: string;
    fingerprint: string;
}): Promise<UploadFileResponse> {
    const token = getToken();

    if (!token) {
        throw new Error("User is not authenticated.");
    }

    const formData = new FormData();
    const encryptedBuffer: ArrayBuffer = params.encryptedBytes.buffer.slice(
        params.encryptedBytes.byteOffset,
        params.encryptedBytes.byteOffset + params.encryptedBytes.byteLength,
    ) as ArrayBuffer;

    formData.append(
        "file",
        new Blob([encryptedBuffer], { type: "application/octet-stream" }),
        params.originalFilename,
    );
    formData.append("originalFilename", params.originalFilename);
    formData.append("contentType", params.contentType);
    formData.append("sizeBytes", String(params.sizeBytes));
    formData.append("encryptionAlgorithm", params.encryptionAlgorithm);
    formData.append("encryptionIv", params.encryptionIv);
    formData.append("fingerprint", params.fingerprint);

    const response = await fetch(`${API_BASE_URL}/api/files`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to upload file.");
    }

    return result.data;
}

export async function downloadFileRequest(
    fileId: string,
    fingerprint: string,
): Promise<DownloadFileResponse> {
    const token = getToken();

    if (!token) {
        throw new Error("User is not authenticated.");
    }

    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/download`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Key-Fingerprint": fingerprint,
        },
    });

    if (!response.ok) {
        let message = "Failed to download file.";

        try {
            const result = await response.json();
            message = result?.error?.message || message;
        } catch {
            // Ignore JSON parsing failure for non-JSON error responses.
        }

        throw new Error(message);
    }

    const originalFilename =
        response.headers.get("X-Original-Filename") || "downloaded-file";
    const contentType =
        response.headers.get("X-Content-Type") || "application/octet-stream";
    const encryptionIv = response.headers.get("X-Encryption-Iv") || "";

    const file = await response.blob();

    return {
        file,
        originalFilename,
        contentType,
        encryptionIv,
    };
}

export async function deleteFileRequest(
    fileId: string,
    fingerprint: string,
): Promise<void> {
    const token = getToken();

    if (!token) {
        throw new Error("User is not authenticated.");
    }

    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/delete`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Key-Fingerprint": fingerprint,
        },
    });

    if (!response.ok) {
        let message = "Failed to delete file.";

        try {
            const result = await response.json();
            message = result?.error?.message || message;
        } catch {
            // Ignore JSON parsing failure for non-JSON error responses.
        }

        throw new Error(message);
    }
}