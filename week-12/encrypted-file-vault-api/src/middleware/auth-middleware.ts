import type { AuthUser, AuthedHandler, Handler } from "../types.ts";
import { verifyToken } from "../utils/jwt.ts";
import { json } from "../utils/response.ts";

function getBearerToken(req: Request): string | null {
    const header = req.headers.get("authorization");

    if (!header) return null;
    if (!header.startsWith("Bearer ")) return null;

    return header.slice(7).trim();
}

export function withAuth(handler: AuthedHandler): Handler {
    return async (req: Request): Promise<Response> => {
        const token = getBearerToken(req);

        if (!token) {
            return json(
                { ok: false, error: { message: "Missing authentication token" } },
                401,
            );
        }

        try {
            const user: AuthUser = await verifyToken(token);
            return await handler(req, user);
        } catch {
            return json(
                { ok: false, error: { message: "Invalid or expired token" } },
                401,
            );
        }
    };
}