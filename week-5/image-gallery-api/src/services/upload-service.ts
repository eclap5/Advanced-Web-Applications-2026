import type { UploadRecord } from "../types.ts";

const UPLOADS_DIR = "uploads";
const DATA_DIR = "data";
const DB_PATH = `${DATA_DIR}/uploads.json`;

// Create directories during application startup if they don't exist.
async function ensureDirs() {
    await Deno.mkdir(UPLOADS_DIR, { recursive: true });
    await Deno.mkdir(DATA_DIR, { recursive: true });
}

// Read the upload records from the JSON file. If the file doesn't exist or is invalid, return an empty array.
async function readDb(): Promise<UploadRecord[]> {
    try {
        const text = await Deno.readTextFile(DB_PATH);
        const parsed = JSON.parse(text) as UploadRecord[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// Write the upload records to the JSON file. This will overwrite the existing file content.
async function writeDb(records: UploadRecord[]) {
    await Deno.writeTextFile(DB_PATH, JSON.stringify(records, null, 2));
}

// A simple utility function to determine file extension based on MIME type.
function extensionFromMime(mimeType: string): string {
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/jpeg") return "jpg";
    if (mimeType === "image/webp") return "webp";
    if (mimeType === "image/gif") return "gif";
    return "bin";
}

// Sort the records by upload date in descending order (newest first) before returning them.
export async function listUploads(): Promise<UploadRecord[]> {
    await ensureDirs();
    const records = await readDb();

    return [...records].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/**
 * Save the uploaded image file and its metadata.
 * The metadata includes a unique ID, original filename, MIME type, file size, upload timestamp, and a URL for accessing the file.
 * This function will write the file itself to the `uploads/` directory and update the `data/uploads.json` file with the new record.
 */
export async function saveUploadedImage(file: File): Promise<UploadRecord> {
    await ensureDirs();

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

    const records = await readDb();
    records.push(record);
    await writeDb(records);

    return record;
}