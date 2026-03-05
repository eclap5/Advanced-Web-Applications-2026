/**
 * This file introduces the functions to be used in handling the JWT token on the client side.
 * The token is stored in the browser's localStorage, and we have functions to get, set and clear the token, as well as a function to check if the user is logged in.
*/

const TOKEN = "token";

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
    return !!getToken();    // Double negation syntax to convert the token string to a boolean. If there is a token, it will return true, otherwise false.
}