/**
 * Repository functions are responsible for direct database interactions. 
 * They execute SQL queries and return data in the form of entities (UploadRow) or domain models (UploadRecord).
*/
import type { Pool, PoolClient, QueryObjectResult } from "@db/postgres";
import type { UploadRecord } from "../types.ts";

// UploadRow type is serving as an entity.
// This could be explained so that it is matching the exact table structure in the database, and is used to map database rows.
type UploadRow = {
    id: string;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    uploaded_at: string;
};

export async function insertUpload(
    pool: Pool,
    record: UploadRecord,
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        await client.queryObject`
            insert into uploads (id, filename, original_name, mime_type, size, uploaded_at)
            values (${record.id}::uuid, ${record.filename}, ${record.originalName}, ${record.mimeType}, ${record.size}, ${record.uploadedAt}::timestamptz)
        `;
    } finally {
        client.release();
    }
}

export async function listUploads(pool: Pool): Promise<UploadRecord[]> {
    const client: PoolClient = await pool.connect();
    try {
        const result: QueryObjectResult<UploadRow> = await client.queryObject<UploadRow>`
            select id, filename, original_name, mime_type, size, uploaded_at
            from uploads
            order by uploaded_at desc
        `;

        return result.rows.map((r: UploadRow) => ({
            id: r.id,
            filename: r.filename,
            originalName: r.original_name,
            mimeType: r.mime_type,
            size: r.size,
            uploadedAt: r.uploaded_at,
            url: `/uploads/${r.filename}`,
        }));
    } finally {
        client.release();
    }
}

export async function findUploadById(pool: Pool, id: string): Promise<UploadRecord | null> {
    const client: PoolClient = await pool.connect();
    try {
        const result: QueryObjectResult<UploadRow> = await client.queryObject<UploadRow>`
            select id, filename, original_name, mime_type, size, uploaded_at
            from uploads
            where id = ${id}::uuid
            limit 1
        `;

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        return {
            id: row.id,
            filename: row.filename,
            originalName: row.original_name,
            mimeType: row.mime_type,
            size: row.size,
            uploadedAt: row.uploaded_at,
            url: `/uploads/${row.filename}`,
        };
    } finally {
        client.release();
    }
}

export async function deleteUploadById(pool: Pool, id: string): Promise<boolean> {
    const client: PoolClient = await pool.connect();
    try {
        const result = await client.queryObject`
            delete from uploads
            where id = ${id}::uuid
        `;

        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
}