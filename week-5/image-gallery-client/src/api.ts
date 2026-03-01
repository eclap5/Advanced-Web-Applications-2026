import type { UploadRecord, ApiResponse } from "./types";

const BASE_URL = "http://localhost:8000";

async function readApi<T>(res: Response): Promise<ApiResponse<T>> {
    return (await res.json()) as ApiResponse<T>;
}

export async function fetchUploads(signal?: AbortSignal): Promise<UploadRecord[]> {
    const res = await fetch(`${BASE_URL}/api/uploads`, { signal });
    const payload = await readApi<UploadRecord[]>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}

export async function uploadImage(file: File): Promise<UploadRecord> {
    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`${BASE_URL}/api/uploads`, {
        method: "POST",
        body: form,
    });

    const payload = await readApi<UploadRecord>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}