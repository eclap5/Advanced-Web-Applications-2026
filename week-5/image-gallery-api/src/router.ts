import { bytes, json } from "./util/response.ts";
import { listUploads, saveUploadedImage } from "./services/upload-service.ts";

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

export async function router(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204 });
    }

    // API: list uploads
    if (req.method === "GET" && url.pathname === "/api/uploads") {
        const uploads = await listUploads();
        return json({ ok: true, data: uploads }, 200);
    }

    // API: upload image
    if (req.method === "POST" && url.pathname === "/api/uploads") {
        try {
            const file = await readImageField(req, "image");
            if (!file) {
                return json({ ok: false, error: "Missing multipart field 'image'." }, 400);
            }

            const record = await saveUploadedImage(file);
            return json({ ok: true, data: record }, 201);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Upload failed.";
            return json({ ok: false, error: message }, 400);
        }
    }

    // Serve uploaded images
    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
        const filename = url.pathname.replace("/uploads/", "");
        return await serveUpload(filename);
    }

    return json({ ok: false, error:"Not Found" }, 404);
}