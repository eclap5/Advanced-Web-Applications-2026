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