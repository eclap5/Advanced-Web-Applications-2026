import * as client from "@panva/openid-client";
import type { GoogleProfile, OidcRequestState } from "../types.ts";
import { oidcConfig } from "../util/oidc-client.ts";

/**
 * Exchanges Google's callback authorization code for validated tokens and profile data.
 *
 * Why: the callback query params are untrusted until we verify PKCE/state/nonce.
 * This call enforces those checks and ensures we only continue with an expected
 * login response created by our app.
 */
export async function exchangeAuthorizationCode(
    callbackUrl: URL,
    stored: OidcRequestState,
): Promise<GoogleProfile> {
    const tokens = await client.authorizationCodeGrant(
        oidcConfig,
        callbackUrl,
        {
            pkceCodeVerifier: stored.codeVerifier,
            expectedState: stored.state,
            expectedNonce: stored.nonce,
            idTokenExpected: true,
        },
    );

    // Claims come from the validated ID token and provide the stable user identity.
    const claims = tokens.claims();

    if (!claims?.sub) {
        throw new Error("Missing subject claim in ID token");
    }

    // UserInfo endpoint requires an access token, so fail early if it is absent.
    const accessToken = tokens.access_token;
    if (!accessToken) {
        throw new Error("Missing access token");
    }

    // Fetch profile details from Google and bind them to the authenticated subject.
    const userInfo = await client.fetchUserInfo(
        oidcConfig,
        accessToken,
        claims.sub,
    );

    // Normalize optional fields into our internal profile shape.
    return {
        sub: claims.sub,
        email: typeof userInfo.email === "string" ? userInfo.email : "",
        name: typeof userInfo.name === "string" ? userInfo.name : "",
        picture: typeof userInfo.picture === "string"
            ? userInfo.picture
            : undefined,
    };
}