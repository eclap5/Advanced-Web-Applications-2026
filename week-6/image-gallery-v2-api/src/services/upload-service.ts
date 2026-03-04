import type { Pool } from "@db/postgres";
import type { UploadRecord } from "../types.ts";
import {
    deleteUploadById,
    findUploadById,
    insertUpload,
    listUploads as listUploadsFromRepo,
} from "../repositories/upload-repository.ts";

const UPLOADS_DIR = "uploads";

async function ensureUploadsDir() {
    await Deno.mkdir(UPLOADS_DIR, { recursive: true });
}

function extensionFromMime(mimeType: string): string {
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/jpeg") return "jpg";
    if (mimeType === "image/webp") return "webp";
    if (mimeType === "image/gif") return "gif";
    return "bin";
}

export async function saveUploadedImage(
    pool: Pool,
    file: File,
): Promise<UploadRecord> {
    await ensureUploadsDir();

    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are supported.");
    }

    const id = crypto.randomUUID();
    const ext = extensionFromMime(file.type);
    const filename = `${id}.${ext}`;
    const path = `${UPLOADS_DIR}/${filename}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(path, bytes);

    const record: UploadRecord = {
        id,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: `/uploads/${filename}`,
    };

    await insertUpload(pool, record);   // Call the repository function to save the record to the database
    return record;
}

export async function listUploads(pool: Pool): Promise<UploadRecord[]> {
    return await listUploadsFromRepo(pool);     // Call the repository function to get the list of uploads from the database
}

export async function deleteUploadedImage(pool: Pool, id: string): Promise<UploadRecord | null> {
    const existing = await findUploadById(pool, id);
    if (!existing) {
        return null;
    }

    const path = `${UPLOADS_DIR}/${existing.filename}`;

    try {
        await Deno.remove(path);
    } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
            throw error;
        }
    }

    const deleted = await deleteUploadById(pool, id);
    if (!deleted) {
        throw new Error("Delete failed.");
    }

    return existing;
}