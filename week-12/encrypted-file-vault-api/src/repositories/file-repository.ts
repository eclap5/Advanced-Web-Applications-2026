import type { Pool } from "@db/postgres";
import type { StoredFile } from "../types.ts";

export async function createFileRecord(
    pool: Pool,
    file: Omit<StoredFile, "createdAt">,
): Promise<StoredFile> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<StoredFile>`
            INSERT INTO files (
                id,
                owner_id,
                original_filename,
                blob_name,
                content_type,
                size_bytes,
                encryption_algorithm,
                encryption_iv
            )
            VALUES (
                ${file.id},
                ${file.ownerId},
                ${file.originalFilename},
                ${file.blobName},
                ${file.contentType},
                ${file.sizeBytes},
                ${file.encryptionAlgorithm},
                ${file.encryptionIv}
            )
            RETURNING
                id,
                owner_id AS "ownerId",
                original_filename AS "originalFilename",
                blob_name AS "blobName",
                content_type AS "contentType",
                size_bytes AS "sizeBytes",
                encryption_algorithm AS "encryptionAlgorithm",
                encryption_iv AS "encryptionIv",
                created_at AS "createdAt"
        `;

        return result.rows[0];
    } finally {
        client.release();
    }
}

export async function getFilesByOwnerId(
    pool: Pool,
    ownerId: string,
): Promise<StoredFile[]> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<StoredFile>`
            SELECT
                id,
                owner_id AS "ownerId",
                original_filename AS "originalFilename",
                blob_name AS "blobName",
                content_type AS "contentType",
                size_bytes AS "sizeBytes",
                encryption_algorithm AS "encryptionAlgorithm",
                encryption_iv AS "encryptionIv",
                created_at AS "createdAt"
            FROM files
            WHERE owner_id = ${ownerId}
            ORDER BY created_at DESC
        `;

        return result.rows;
    } finally {
        client.release();
    }
}

export async function getFileByIdAndOwnerId(
    pool: Pool,
    fileId: string,
    ownerId: string,
): Promise<StoredFile | null> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<StoredFile>`
            SELECT
                id,
                owner_id AS "ownerId",
                original_filename AS "originalFilename",
                blob_name AS "blobName",
                content_type AS "contentType",
                size_bytes AS "sizeBytes",
                encryption_algorithm AS "encryptionAlgorithm",
                encryption_iv AS "encryptionIv",
                created_at AS "createdAt"
            FROM files
            WHERE id = ${fileId} AND owner_id = ${ownerId}
        `;

        return result.rows[0] ?? null;
    } finally {
        client.release();
    }
}

export async function getUserFingerprint(
    pool: Pool,
    userId: string,
): Promise<string | null> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<{ encryptionKeyFingerprint: string | null }>`
            SELECT encryption_key_fingerprint AS "encryptionKeyFingerprint"
            FROM users
            WHERE id = ${userId}
        `;

        return result.rows[0]?.encryptionKeyFingerprint ?? null;
    } finally {
        client.release();
    }
}