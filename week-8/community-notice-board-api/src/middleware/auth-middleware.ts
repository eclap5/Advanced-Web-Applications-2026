import type { AuthUser, AuthedHandler, Handler } from "../types.ts";
import { verifyToken } from "../util/jwt.ts";
import { json } from "../util/response.ts";

// Extract the Bearer token from the Authorization header.
function getBearerToken(req: Request): string | null {
    const header = req.headers.get("authorization");

    if (!header) return null;
    if (!header.startsWith("Bearer ")) return null;

    return header.slice(7).trim();
}

// Middleware to protect routes that require authentication. It verifies the JWT token and passes the authenticated user to the handler.
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
            const user = await verifyToken(token);
            return await handler(req, user as AuthUser);
        } catch {
            return json(
                { ok: false, error: { message: "Invalid or expired token" } },
                401,
            );
        }
    };
}

// Middleware to protect routes that require admin access. It uses the withAuth middleware to first authenticate the user and then checks if the user has admin role.
export function withAdmin(handler: AuthedHandler): Handler {
    return withAuth(async (req, user) => {
        if (user.role !== "admin") {
            return json(
                { ok: false, error: { message: "Forbidden: admin access required" } },
                403,
            );
        }

        return await handler(req, user);
    });
}