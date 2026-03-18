# Service provider authentication with OpenID Connect (OIDC)

This week focuses on implementing third-party authentication with Google using OpenID Connect (OIDC). The back-end performs the OAuth2/OIDC authorization code flow with PKCE, validates callback state and nonce, and stores authenticated users in a cookie-based session. The front-end then protects routes and displays the signed-in user's profile.
In client side we also add internationalization (i18n) support with `react-i18next` and a simple language switcher.

# Week 10 Walkthrough

## Prerequisites

Before running the API, create `profile-viewer-api/.env` with:

```env
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=TODO_AFTER_GCP_CONFIGURATION
GOOGLE_CLIENT_SECRET=TODO_AFTER_GCP_CONFIGURATION
```

The Google values are intentionally placeholders and should be filled after completing the GCP setup section at the end of this document.

### Libraries used

API (`profile-viewer-api`):

- `jsr:@panva/openid-client` for OIDC discovery, PKCE, authorization URL creation, token exchange, and user info retrieval.

Client (`profile-viewer-client`):

- `react-router-dom`
- `@mui/material`, `@emotion/react`, `@emotion/styled`
- `i18next`, `react-i18next`

## 1) Implement the back-end first (`profile-viewer-api`)

1. Configure OIDC client in `src/util/oidc-client.ts`:
	- Discover Google issuer metadata.
	- Build authorization requests with PKCE (`code_verifier` and `code_challenge`).
	- Store pending request state/nonce/code verifier for callback validation.

2. Implement token exchange and profile mapping in `src/services/google-auth-service.ts`:
	- Exchange authorization code for tokens.
	- Validate expected state/nonce via the OIDC client.
	- Fetch UserInfo and map it into `GoogleProfile`.

3. Implement session handling in `src/services/session-service.ts`:
	- Create session IDs and store user profile in memory.
	- Read and destroy sessions.

4. Implement cookie utilities in `src/util/cookie.ts`:
	- Read incoming `session` cookie.
	- Set and clear session cookie headers.

5. Implement middleware:
	- `src/middleware/require-auth-middleware.ts` resolves session from cookie and returns the authenticated user.
	- `src/middleware/logger-middleware.ts` logs requests, response status, and request duration.

6. Implement response helpers in `src/util/response.ts`:
	- CORS headers (with credentials support).
	- JSON helper and redirect helper.

7. Implement routes in `src/router.ts`:
	- `GET /auth/google/login` starts Google sign-in.
	- `GET /auth/google/callback` handles OIDC callback and creates session.
	- `GET /api/me` returns authenticated user profile.
	- `POST /auth/logout` destroys session and clears cookie.
	- `OPTIONS` handles CORS preflight.

8. Wire server in `src/main.ts`:
	- Start `Deno.serve(...)` on port `8000`.
	- Wrap router with logging middleware.

### Start script and command

Start script in `deno.json`:

```json
"dev": "deno run --watch --allow-net --allow-env --env-file=.env src/main.ts"
```

Run API:

```bash
cd profile-viewer-api
deno task dev
```

## 2) Implement the front-end (`profile-viewer-client`)

1. Add API calls in `src/api.ts`:
	- `fetchMe()` to read the authenticated profile from `/api/me`.
	- `logout()` to clear server session via `/auth/logout`.

2. Configure routes in `src/App.tsx`:
	- Public route: `/` (login).
	- Protected route: `/profile`.

3. Add route protection in `src/components/ProtectedRoute.tsx`:
	- Check auth state by calling `/api/me`.
	- Redirect unauthenticated users back to login.

4. Implement pages:
	- `src/pages/LoginPage.tsx` with Google sign-in button redirecting to API login route.
	- `src/pages/ProfilePage.tsx` to display profile details and support logout.

5. Add language switching and translations:
	- `src/components/LanguageSwitcher.tsx`
	- `src/i18n/index.ts`, `src/i18n/en.ts`, `src/i18n/fi.ts`

6. Add theme and app bootstrap:
	- `src/theme.ts` for MUI theme.
	- `src/main.tsx` for `ThemeProvider`, `CssBaseline`, i18n initialization, and app render.

### Client dependencies and commands

Install and run with deno:

```bash
cd profile-viewer-client
deno task dev
```

## 3) Configure GCP project (do this last)

1. Navigate to Google Cloud Console and create a new project.
2. From the project dashboard, go to "APIs & Services" > "Credentials".
3. Click "Create Credentials" and select "OAuth client ID".
4. If prompted, configure the consent screen (you can set the Audience to "External" and fill in the required fields).
5. Choose "Web application" as the application type.
6. Under "Authorized redirect URIs", add:
   - `http://localhost:8000/auth/google/callback`
   - This URI must match the callback route defined in your API for handling the OIDC response.
7. Under the Authorized JavaScript origins, add:
   - `http://localhost:8000`
   - Here we can also add the frontend origin `http://localhost:5173` if needed for CORS, but it's not strictly required for the OAuth flow since the redirect URI is what matters for the callback.
8. After creating the credentials, copy the generated Client ID and Client Secret. 
   - Note that these are shown only once.
   - Add the credentials to the `profile-viewer-api/.env` file as follows:
     ```env
     GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret
     ```
9. Restart the API server to load the new environment variables.
   - Note that registering the service may take a few minutes to propagate, so if you encounter errors during login, give it some time and try again. 

After this final step, test the full sign-in flow from the client login page.