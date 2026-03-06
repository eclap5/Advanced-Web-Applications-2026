import { clearToken, getToken } from "./auth";
import type { ApiResponse, Notification, PublicUser } from "./types";

const BASE_URL = "http://localhost:8000";

async function readApi<T>(res: Response): Promise<ApiResponse<T>> {
    return (await res.json()) as ApiResponse<T>;
}

function authHeaders(): HeadersInit {
    const token = getToken();

    return token
        ? {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
        }
        : {
            "content-type": "application/json",
        };
}

async function handleUnauthorized(res: Response) {
    if (res.status === 401) {
        clearToken();
        throw new Error("UNAUTHORIZED");
    }
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

    const payload = await readApi<{ token: string }>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data.token;
}

export async function fetchNotifications(): Promise<Notification[]> {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    });

    await handleUnauthorized(res);

    const payload = await readApi<Notification[]>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}

export async function createNotification(input: {
    title: string;
    content: string;
}): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/admin/notifications`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: JSON.stringify(input),
    });

    await handleUnauthorized(res);

    const payload = await readApi<null>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }
}

export async function fetchUsers(): Promise<PublicUser[]> {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    });

    await handleUnauthorized(res);

    const payload = await readApi<PublicUser[]>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}

export async function deleteUser(userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    });

    await handleUnauthorized(res);

    const payload = await readApi<null>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }
}