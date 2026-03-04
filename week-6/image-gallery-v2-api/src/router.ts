import { bytes, corsHeaders, json } from "./util/response.ts";
import { deleteUploadedImage, saveUploadedImage, listUploads } from "./services/upload-service.ts";
import { pool } from "./db/pool.ts";

function contentTypeFromPath(path: string): string {
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
    if (path.endsWith(".webp")) return "image/webp";
    if (path.endsWith(".gif")) return "image/gif";
    return "application/octet-stream";
}

async function readImageField(req: Request, fieldName: string): Promise<File | null> {
    const form = await req.formData();
    const value = form.get(fieldName);

    if (!value) return null;
    if (value instanceof File) return value;

    return null;
}

async function serveUpload(filename: string): Promise<Response> {
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return json({ ok: false, error: "Bad Request" }, 400);
    }

    const path = `uploads/${filename}`;

    try {
        const data = await Deno.readFile(path);
        return bytes(data, 200, contentTypeFromPath(path));
    } catch {
        return json({ ok: false, error: "Not Found" }, 404);
    }
}

async function handleListUploads(): Promise<Response> {
    const uploads = await listUploads(pool);
    return json({ ok: true, data: uploads }, 200);
}

async function handleUploadImage(req: Request): Promise<Response> {
    try {
        const file = await readImageField(req, "image");
        if (!file) {
            return json({ ok: false, error: "Missing multipart field 'image'." }, 400);
        }

        const record = await saveUploadedImage(pool, file);
        return json({ ok: true, data: record }, 201);
    } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed.";
        return json({ ok: false, error: message }, 400);
    }
}

async function handleDeleteUpload(pathname: string): Promise<Response> {
    const id = pathname.replace("/api/uploads/", "").trim();

    if (!id) {
        return json({ ok: false, error: "Missing upload id." }, 400);
    }

    try {
        const deleted = await deleteUploadedImage(pool, id);
        if (!deleted) {
            return json({ ok: false, error: "Upload not found." }, 404);
        }

        return json({ ok: true, data: deleted }, 200);
    } catch (e) {
        const message = e instanceof Error ? e.message : "Delete failed.";
        return json({ ok: false, error: message }, 400);
    }
}

export async function router(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // API: list uploads
    if (req.method === "GET" && url.pathname === "/api/uploads") {
        return await handleListUploads();
    }

    // API: upload image
    if (req.method === "POST" && url.pathname === "/api/uploads") {
        return await handleUploadImage(req);
    }

    // API: delete upload
    if (req.method === "DELETE" && url.pathname.startsWith("/api/uploads/")) {
        return await handleDeleteUpload(url.pathname);
    }

    // Serve uploaded images
    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
        const filename = url.pathname.replace("/uploads/", "");
        return await serveUpload(filename);
    }

    return json({ ok: false, error:"Not Found" }, 404);
}