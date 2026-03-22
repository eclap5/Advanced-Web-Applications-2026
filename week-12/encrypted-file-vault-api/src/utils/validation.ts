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

function isStrongPassword(value: string): boolean {
    const hasMinLength = value.length >= 8;
    const hasUpperCase = value.toLowerCase() !== value;
    const hasNumber = [...value].some((char) => char >= "0" && char <= "9");
    const hasSpecialChar = [...value].some((c) => !/[a-zA-Z0-9]/.test(c));

    return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
}

function getPasswordPolicyViolations(value: string): string[] {
    const violations: string[] = [];

    if (value.length < 8) {
        violations.push("at least 8 characters");
    }

    if (value.toLowerCase() === value) {
        violations.push("at least one uppercase letter");
    }

    const hasNumber = [...value].some((char) => char >= "0" && char <= "9");
    if (!hasNumber) {
        violations.push("at least one number");
    }

    const hasSpecialChar = [...value].some((char) => !/[a-zA-Z0-9]/.test(char));
    if (!hasSpecialChar) {
        violations.push("at least one special character");
    }

    return violations;
}

type RegisterParseResult =
    | {
        ok: true;
        data: { email: string; password: string; inviteCode: string };
    }
    | {
        ok: false;
        error: string;
    };

export function parseRegisterBody(body: unknown): RegisterParseResult {
    if (typeof body !== "object" || body === null) {
        return { ok: false, error: "Invalid request body" };
    }

    const b = body as Record<string, unknown>;

    if (typeof b.email !== "string" || typeof b.password !== "string" || typeof b.inviteCode !== "string") {
        return {
            ok: false,
            error: "Email, password, and invite code are required",
        };
    }

    const email = normalizeEmail(b.email);
    const password = b.password;
    const inviteCode = b.inviteCode;

    if (!isValidEmail(email)) {
        return { ok: false, error: "Please provide a valid email address" };
    }

    if (!isStrongPassword(password)) {
        const violations = getPasswordPolicyViolations(password);

        return {
            ok: false,
            error: `Password must include ${violations.join(", ")}.`,
        };
    }

    return {
        ok: true,
        data: { email, password, inviteCode },
    };
}

export function parseLoginBody(body: unknown): { email: string; password: string } | null {
    if (typeof body !== "object" || body === null) return null;

    const b = body as Record<string, unknown>;

    if (typeof b.email !== "string" || typeof b.password !== "string") {
        return null;
    }

    const email = normalizeEmail(b.email);
    const password = b.password;

    if (!isValidEmail(email)) return null;

    return { email, password };
}