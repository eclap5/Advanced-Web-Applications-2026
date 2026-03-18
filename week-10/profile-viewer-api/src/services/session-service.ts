/**
 * Session management for authenticated users.
 * User data is stored in-memory as a session object keyed by a random session ID. 
 * The session ID is sent to the client as a cookie and used to look up the user's profile on subsequent requests.
 *
 * Why: This simple session mechanism allows us to maintain user authentication state across requests without needing
 * to re-validate the user's identity on every request. In a production app, you would likely want to use a more robust
 * session store (like Redis) and implement additional security measures (like HttpOnly cookies, secure cookies, etc.).
 */

import type { GoogleProfile } from "../types.ts";

const sessions = new Map<string, GoogleProfile>();

export function createSession(profile: GoogleProfile): string {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, profile);
    return sessionId;
}

export function getSession(sessionId: string): GoogleProfile | null {
    return sessions.get(sessionId) ?? null;
}

export function destroySession(sessionId: string): void {
    sessions.delete(sessionId);
}