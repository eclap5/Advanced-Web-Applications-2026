import { pool } from "./db/pool.ts";
import { loginUser, registerUser, setUserEncryptionKeyFingerprint } from "./services/auth-service.ts";
import { findUserById } from "./repositories/user-repository.ts";
import type { AuthUser, Handler, LoginResult, RouteKey } from "./types.ts";
import { corsHeaders, json } from "./utils/response.ts";
import { withAuth } from "./middleware/auth-middleware.ts";

async function registerHandler(req: Request): Promise<Response> {
    const body = await req.json();
    const { email, password, inviteCode } = body;

    if (typeof email !== "string" || typeof password !== "string" || typeof inviteCode !== "string") {
        return json(
            { ok: false, error: { message: "Email, password, and invite code are required" } },
            400,
        );
    }

    try {
        await registerUser(pool, email, password, inviteCode);
        return json({ ok: true }, 201);
    } catch (e: unknown) {
        if (e instanceof Error && e.message === "User with this email already exists") {
            return json(
                { ok: false, error: { message: "Email already in use" } },
                409,
            );
        }
        if (e instanceof Error && e.message === "Invalid invite code") {
            return json(
                { ok: false, error: { message: e.message } },
                400,
            );
        }
        return json(
            { ok: false, error: { message: "An error occurred while registering the user" } },
            500,
        );
    }
}

async function loginHandler(req: Request): Promise<Response> {
    const body = await req.json();
    const { email, password } = body;

    if (typeof email !== "string" || typeof password !== "string") {
        return json(
            { ok: false, error: { message: "Email and password are required" } },
            400,
        );
    }

    try {
        const loginResult: LoginResult = await loginUser(pool, email, password);
        return json({ ok: true, data: loginResult }, 200);
    } catch (e: unknown) {
        if (e instanceof Error && e.message === "Invalid email or password") {
            return json(
                { ok: false, error: { message: "Invalid email or password" } },
                401,
            );
        }
        return json(
            { ok: false, error: { message: "An error occurred while logging in" } },
            500,
        );
    }
}

const onboardingHandler = withAuth(async (req: Request, user: AuthUser) => {
    const body = await req.json();
    const encryptionKeyFingerprint: string = body.encryptionKeyFingerprint;
    const userId = user.id;

    try {
        await setUserEncryptionKeyFingerprint(pool, userId, encryptionKeyFingerprint);
        return json({ ok: true }, 200);
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("Error in onboardingHandler:", e);
        }
        return json(
            { ok: false, error: { message: "An error occurred while setting the encryption key fingerprint" } },
            500,
        );
    }
});

const profileHandler = withAuth(async (_req: Request, user: AuthUser) => {
    const dbUser = await findUserById(pool, user.id);

    if (!dbUser) {
        return json(
            { ok: false, error: { message: "User not found" } },
            404,
        );
    }

    return json(
        {
            ok: true,
            data: {
                id: dbUser.id,
                email: dbUser.email,
                hasEncryptionKey: Boolean(dbUser.encryptionKeyFingerprint),
            },
        },
        200,
    );
});
    

const routes = new Map<RouteKey, Handler>([
    ["POST /api/auth/register", registerHandler],
    ["POST /api/auth/login", loginHandler],
    ["POST /api/auth/onboarding", onboardingHandler],
    ["GET /api/auth/profile", profileHandler],
]);

export async function router(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const key: RouteKey = `${req.method} ${url.pathname}`;
    const handler = routes.get(key);

    if (!handler) {
        return json({ ok: false, error: { message: "Not found" } }, 404);
    }

    return await handler(req);
}