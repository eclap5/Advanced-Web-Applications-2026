/**
 * Utility functions for handling cookies in the application
 * This includes reading cookies from incoming requests and creating Set-Cookie headers for responses.
 * This is a good place to introduce cookie management in a web application, which is essential for maintaining user sessions and authentication state.
 */

export function readCookie(req: Request, name: string): string | null {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").map((part) => part.trim());

    for (const cookie of cookies) {
        const [key, ...rest] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(rest.join("="));
        }
    }

    return null;
}

export function createSessionCookie(sessionId: string): string {
    return [
        `session=${encodeURIComponent(sessionId)}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
    ].join("; ");
}

export function clearSessionCookie(): string {
    return [
        "session=",
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        "Max-Age=0",
    ].join("; ");
}