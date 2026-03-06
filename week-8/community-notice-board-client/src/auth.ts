import type { JwtPayload } from "./types";

const TOKEN = "token";

export function setToken(token: string): void {
    localStorage.setItem(TOKEN, token);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN);
}

// Now as we need the user info to determine whether the user is admin user or not, we need to decode the token to get the user info.
export function decodeToken(): JwtPayload | null {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch {
        return null;
    }
}

export function isLoggedIn(): boolean {
    return !!getToken();
}

export function isAdmin(): boolean {
    const payload = decodeToken();
    return payload?.role === "admin";
}