const TOKEN = "secret_notes_token";

export function getToken(): string | null {
    return localStorage.getItem(TOKEN);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN);
}

export function isLoggedIn(): boolean {
    return !!getToken();
}