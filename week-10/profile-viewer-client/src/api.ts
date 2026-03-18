export type UserProfile = {
    sub: string;
    email: string;
    name: string;
    picture?: string;
};

const BASE_URL = "http://localhost:8000";

export async function fetchMe(): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/api/me`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("UNAUTHORIZED");
    }

    return await res.json();
}

export async function logout(): Promise<void> {
    await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
}