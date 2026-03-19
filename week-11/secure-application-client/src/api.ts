const BASE_URL = "http://localhost:8000";

async function readJson(res: Response) {
    return await res.json();
}

export async function register(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    return readJson(res);
}

export async function login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    return readJson(res);
}

export async function searchUsersByEmail(email: string) {
    const res = await fetch(
        `${BASE_URL}/api/users/search?email=${encodeURIComponent(email)}`,
    );
    return readJson(res);
}

export async function getAdminAudit(role: string) {
    const res = await fetch(
        `${BASE_URL}/api/admin/audit?role=${encodeURIComponent(role)}`,
    );
    return readJson(res);
}

export async function getNote(noteId: string, token: string) {
    const res = await fetch(`${BASE_URL}/api/notes/${noteId}`, {
        headers: {
            authorization: `Bearer ${token}`,
        },
    });
    return readJson(res);
}

export async function deleteUser(userId: string) {
    const res = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
    });
    return readJson(res);
}

export async function getDebugConfig() {
    const res = await fetch(`${BASE_URL}/api/debug/config`);
    return readJson(res);
}