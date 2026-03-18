import { requireAuth } from "./middleware/require-auth-middleware.ts";
import { exchangeAuthorizationCode } from "./services/google-auth-service.ts";
import { createSession, destroySession } from "./services/session-service.ts";
import { GoogleProfile, OidcRequestState } from "./types.ts";
import { clearSessionCookie, createSessionCookie, readCookie } from "./util/cookie.ts";
import { consumeAuthorizationRequestState, createAuthorizationRequest } from "./util/oidc-client.ts";
import { corsHeaders, json, redirect } from "./util/response.ts";

const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "http://localhost:5173";

function handleOptionsRequest(): Response {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(),
    });
}

async function handleGoogleLogin(): Promise<Response> {
    const { authorizationUrl } = await createAuthorizationRequest();
    return redirect(authorizationUrl.href);
}

async function handleGoogleCallback(url: URL): Promise<Response> {
    const state: string | null = url.searchParams.get("state");
    const error: string | null = url.searchParams.get("error");

    if (error) {
        return redirect(`${FRONTEND_URL}/?error=google_auth_failed`);
    }

    if (!state) {
        return json({ error: "Missing state" }, 400);
    }

    const stored: OidcRequestState | null = consumeAuthorizationRequestState(state);

    if (!stored) {
        return json({ error: "State mismatch or expired request" }, 400);
    }

    try {
        const profile: GoogleProfile = await exchangeAuthorizationCode(url, stored);
        const sessionId: string = createSession(profile);

        return new Response(null, {
            status: 302,
            headers: {
                location: `${FRONTEND_URL}/profile`,
                "set-cookie": createSessionCookie(sessionId),
            },
        });
    } catch (error: unknown) {
        console.error("Google callback failed:", error);
        return redirect(`${FRONTEND_URL}/?error=callback_failed`);
    }
}

function handleGetMe(req: Request): Response {
    const user: GoogleProfile | null = requireAuth(req);

    if (!user) {
        return json({ error: "Unauthorized" }, 401);
    }

    return json(user, 200);
}

function handleLogout(req: Request): Response {
    const sessionId: string | null = readCookie(req, "session");

    if (sessionId) {
        destroySession(sessionId);
    }

    return new Response(null, {
        status: 204,
        headers: {
            "set-cookie": clearSessionCookie(),
            ...corsHeaders(),
        },
    });
}

export async function router(req: Request): Promise<Response> {
    const url: URL = new URL(req.url);

    if (req.method === "OPTIONS") {
        return handleOptionsRequest();
    }

    if (req.method === "GET" && url.pathname === "/auth/google/login") {
        return await handleGoogleLogin();
    }

    if (req.method === "GET" && url.pathname === "/auth/google/callback") {
        return await handleGoogleCallback(url);
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
        return handleGetMe(req);
    }

    if (req.method === "POST" && url.pathname === "/auth/logout") {
        return handleLogout(req);
    }

    return json({ error: "Not found" }, 404);
}