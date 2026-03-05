import type { ApiResponse, Note } from "./types";
import { getToken } from "./auth";

const BASE_URL = "http://localhost:8000";

async function readApi<T>(res: Response): Promise<ApiResponse<T>> {
    return (await res.json()) as ApiResponse<T>;
}

export async function register(email: string, password: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const payload = await readApi<null>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }
}

export async function login(email: string, password: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const payload = await res.json() as { ok: boolean; token?: string; error?: { message: string } };

    if (!res.ok || !payload.ok || !payload.token) {
        throw new Error(payload.error?.message ?? `HTTP ${res.status}`);
    }

    return payload.token;
}

export async function fetchNotes(): Promise<Note[]> {
    const token = getToken();

    const res = await fetch(`${BASE_URL}/api/notes`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });

    // Special-case 401 so UI can redirect
    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    const payload = await readApi<Note[]>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}