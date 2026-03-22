import type { Pool } from "@db/postgres";
import type { AuthUser, StoredFile } from "../types.ts";
import {
    createFileRecord,
    getFileByIdAndOwnerId,
    getFilesByOwnerId,
    getUserFingerprint,
} from "../repositories/file-repository.ts";
import { downloadBlob, uploadBlob } from "./blob-storage-service.ts";

export async function verifyUserFingerprint(
    pool: Pool,
    userId: string,
    fingerprint: string,
): Promise<void> {
    const storedFingerprint = await getUserFingerprint(pool, userId);

    if (!storedFingerprint) {
        throw new Error("Encryption key fingerprint is not configured for user.");
    }

    if (storedFingerprint !== fingerprint) {
        throw new Error("Provided encryption key fingerprint does not match user account.");
    }
}

export async function createEncryptedFile(
    pool: Pool,
    user: AuthUser,
    input: {
        encryptedBytes: Uint8Array;
        originalFilename: string;
        contentType: string;
        sizeBytes: number;
        encryptionAlgorithm: string;
        encryptionIv: string;
        fingerprint: string;
    },
): Promise<StoredFile> {
    await verifyUserFingerprint(pool, user.id, input.fingerprint);

    const id = crypto.randomUUID();
    const blobName = `${user.id}/${id}`;

    await uploadBlob(blobName, input.encryptedBytes);

    return await createFileRecord(pool, {
        id,
        ownerId: user.id,
        originalFilename: input.originalFilename,
        blobName,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        encryptionAlgorithm: input.encryptionAlgorithm,
        encryptionIv: input.encryptionIv,
    });
}

export async function listUserFiles(
    pool: Pool,
    user: AuthUser,
): Promise<StoredFile[]> {
    return await getFilesByOwnerId(pool, user.id);
}

export async function getEncryptedFileForDownload(
    pool: Pool,
    user: AuthUser,
    fileId: string,
    fingerprint: string,
): Promise<{
    metadata: StoredFile;
    encryptedBytes: Uint8Array;
}> {
    await verifyUserFingerprint(pool, user.id, fingerprint);

    const file = await getFileByIdAndOwnerId(pool, fileId, user.id);

    if (!file) {
        throw new Error("File not found.");
    }

    const encryptedBytes = await downloadBlob(file.blobName);

    return {
        metadata: file,
        encryptedBytes,
    };
}