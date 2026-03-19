import type { LoginCredentials, LoginResponse, RegisterCredentials, User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginRequest(
    credentials: LoginCredentials,
): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const data = await response.json() ?? null;
        const errorText = data?.error?.message;

        throw new Error(errorText || "Login failed.");
    }

    const result = await response.json();

    return result.data;
}

export async function registerRequest(
    credentials: RegisterCredentials,
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const data = await response.json() ?? null;
        const errorText = data?.error?.message;
        
        throw new Error(errorText || "Registration failed.");
    }
}

export async function getCurrentUserRequest(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch current user.");
    }

    return await response.json();
}