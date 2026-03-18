import type { GoogleProfile } from "../types.ts";
import { getSession } from "../services/session-service.ts";
import { readCookie } from "../util/cookie.ts";

export function requireAuth(req: Request): GoogleProfile | null {
    const sessionId = readCookie(req, "session");
    if (!sessionId) {
        return null;
    }

    return getSession(sessionId);
}