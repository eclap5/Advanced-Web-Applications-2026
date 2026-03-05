import { pool } from "./db/pool.ts";
import { json, corsHeaders } from "./util/response.ts";
import { login, register } from "./services/auth-service.ts";
import { listNotes } from "./repositories/notes-repository.ts";
import { requireAuth } from "./middleware/auth-middleware.ts";

async function readJson(req: Request) {
    try {
        return await req.json();
    } catch {
        return null;
    }
}

async function handleRegister(req: Request): Promise<Response> {
    try {
        const body = await readJson(req);

        await register(pool, body.email, body.password);

        return json({ ok: true });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
            return json({ ok: false, error: { message: "Email already in use" } }, 409);
        }

        console.error(error);

        return json({ ok: false, error: { message: "Internal server error" } }, 500);
    }
}

async function handleLogin(req: Request): Promise<Response> {
    try {
        const body = await readJson(req);
        const token = await login(pool, body.email, body.password);
        return json({ ok: true, token });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            return json({ ok: false, error: { message: "Invalid email or password" } }, 401);
        }

        console.error(error);
        return json({ ok: false, error: { message: "Internal server error" } }, 500);
    }
}

async function handleListNotes(req: Request): Promise<Response> {
    try {
        const userId = await requireAuth(req);      // Check if the user is authenticated by verifying the JWT token.
        if (!userId) {
            return json({ ok: false, error: { message: "Not authenticated" } }, 401);
        }
        const notes = await listNotes(pool);
        return json({ ok: true, data: notes });
    } catch (error: unknown) {
        console.error(error);
        return json({ ok: false, error: { message: "Internal server error" } }, 500);
    }
}

export async function router(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === "/api/auth/register" && req.method === "POST") {
        return await handleRegister(req);
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
        return await handleLogin(req);
    }

    if (url.pathname === "/api/notes" && req.method === "GET") {
        return await handleListNotes(req);
    }

    return new Response("Not Found", { status: 404 });
}