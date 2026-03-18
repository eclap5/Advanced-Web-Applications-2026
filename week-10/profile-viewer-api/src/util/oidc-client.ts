import * as client from "@panva/openid-client";
import type { OidcRequestState } from "../types.ts";

// Google is the single OIDC provider for this app, so discovery is fixed to its issuer.
const GOOGLE_ISSUER = new URL("https://accounts.google.com");

const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
const baseUrl = Deno.env.get("BASE_URL");

if (!clientId || !clientSecret || !baseUrl) {
    throw new Error("Missing required environment variables");
}

// Redirect URI must match the value registered in Google Cloud Console.
export const redirectUri = `${baseUrl}/auth/google/callback`;

// Perform OIDC discovery once at startup to load provider endpoints and metadata.
export const oidcConfig = await client.discovery(
    GOOGLE_ISSUER,
    clientId,
    clientSecret,
);

// Stores short-lived login request data keyed by state so callbacks can be verified.
// Keeping this in memory is enough for a single-instance app and avoids extra storage complexity.
const pendingRequests = new Map<string, OidcRequestState>();

/**
 * Creates a new Google authorization request with PKCE and CSRF protection values.
 *
 * Why: OAuth callbacks are only safe if we can prove they correspond to a login
 * request started by this server. We generate and persist state/nonce/codeVerifier
 * now so they can be validated and used when exchanging the authorization code.
 * 
 * It would be advisable to explain the PKCE flow as it is a critical part of the security of the OIDC flow, especially in public clients.
 */
export async function createAuthorizationRequest() {
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();
    const nonce = client.randomNonce();

    const parameters: Record<string, string> = {
        redirect_uri: redirectUri,
        scope: "openid email profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
        nonce,
    };

    const authorizationUrl = client.buildAuthorizationUrl(
        oidcConfig,
        parameters,
    );

    pendingRequests.set(state, {
        state,
        nonce,
        codeVerifier,
        createdAt: Date.now(),
    });

    return {
        authorizationUrl,
        state,
    };
}

/**
 * Reads and removes the stored request state for a callback.
 *
 * Why: state values are one-time tokens. Deleting after read prevents replay of
 * old authorization responses and narrows the window for abuse.
 */
export function consumeAuthorizationRequestState(
    state: string,
): OidcRequestState | null {
    const stored = pendingRequests.get(state) ?? null;
    if (stored) {
        pendingRequests.delete(state);
    }
    return stored;
}