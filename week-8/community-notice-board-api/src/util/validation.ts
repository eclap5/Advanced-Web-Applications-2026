import type {
    CreateNotificationBody,
    AuthBody
} from "../types.ts";

export async function readJson(req: Request): Promise<unknown> {
    try {
        return await req.json();
    } catch {
        return null;
    }
}

function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
    if (!value.includes("@")) return false;

    const [localPart, domain] = value.split("@");
    
    if (!localPart || !domain) return false;
    if (!domain.includes(".")) return false;
    
    return true;
}

// Validate password strength: at least 8 characters, at least one uppercase letter, at least one number, and at least one special character.
function isStrongPassword(value: string): boolean {
    const hasMinLength = value.length >= 8;
    const hasUpperCase = value.toLowerCase() !== value;
    const hasNumber = [...value].some((char) => char >= "0" && char <= "9");
    const hasSpecialChar = [...value].some((c) => !/[a-zA-Z0-9]/.test(c));      // Use regex to check if a character does not match letters or digits

    return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
}

// Note that in a more advanced app we would separate the validation logic for registration and login, but as we have fairly simple auth models we can use the same for now.
export function parseAuthBody(body: unknown): AuthBody | null {
    if (typeof body !== "object" || body === null) return null;

    const b = body as Record<string, unknown>;

    if (typeof b.email !== "string" || typeof b.password !== "string") {
        return null;
    }

    const email = normalizeEmail(b.email);
    const password = b.password;

    if (!isValidEmail(email)) return null;
    if (!isStrongPassword(password)) return null;

    return { email, password };
}

export function parseCreateNotificationBody(
    body: unknown,
): CreateNotificationBody | null {
    if (typeof body !== "object" || body === null) return null;

    const b = body as Record<string, unknown>;

    if (typeof b.title !== "string" || typeof b.content !== "string") {
        return null;
    }

    const title = b.title.trim();
    const content = b.content.trim();

    if (!title || !content) return null;

    return { title, content };
}