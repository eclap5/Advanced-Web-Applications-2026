import { pool } from "./db/pool.ts";
import { withAdmin, withAuth } from "./middleware/auth-middleware.ts";
import { listUsers, deleteUser } from "./services/user-service.ts";
import { createNotification, listNotifications } from "./services/notification-service.ts";
import { loginUser, registerUser } from "./services/auth-service.ts";
import { corsHeaders, json } from "./util/response.ts";
import {
    parseCreateNotificationBody,
    parseAuthBody,
    readJson
} from "./util/validation.ts";
import type { Handler } from "./types.ts";

// Handle user registration, create a new user in the database.
async function registerHandler(req: Request): Promise<Response> {
    const body = await readJson(req);
    const parsed = parseAuthBody(body);

    if (!parsed) {
        return json(
            {
                ok: false,
                error: { message: "Password must contain at least 8 characters, one uppercase letter, one number, and one special character.", },
            },
            400,
        );
    }

    try {
        await registerUser(pool, parsed.email, parsed.password);
        return json({ ok: true }, 201);
    } catch (e) {
        if (e instanceof Error && e.message === "EMAIL_ALREADY_EXISTS") {
            return json(
                { ok: false, error: { message: "Email already in use" } },
                409,
            );
        }

        return json(
            { ok: false, error: { message: "Internal server error" } },
            500,
        );
    }
}

// Handle user login, return JWT token if successful.
async function loginHandler(req: Request): Promise<Response> {
    const body = await readJson(req);
    const parsed = parseAuthBody(body);

    if (!parsed) {
        return json(
            { ok: false, error: { message: "Invalid email or password" } },
            400,
        );
    }

    try {
        const token = await loginUser(pool, parsed.email, parsed.password);
        return json({ ok: true, data: { token } }, 200);
    } catch (e) {
        if (e instanceof Error && e.message === "INVALID_CREDENTIALS") {
            return json(
                { ok: false, error: { message: "Invalid credentials" } },
                401,
            );
        }

        return json(
            { ok: false, error: { message: "Internal server error" } },
            500,
        );
    }
}

// Use underscore to indicate that the parameter is intentionally ununsed, to avoid linting errors.
// Get all notifications for authenticated users.
const getNotificationsHandler = withAuth(async (_req, _user) => {
    const notifications = await listNotifications(pool);
    return json({ ok: true, data: notifications }, 200);
});

// Create a new notification, only for admin users.
const createNotificationHandler = withAdmin(async (req, user) => {
    const body = await readJson(req);
    const parsed = parseCreateNotificationBody(body);

    if (!parsed) {
        return json(
            { ok: false, error: { message: "Title and content are required" } },
            400,
        );
    }

    const created = await createNotification(pool, {
        title: parsed.title,
        content: parsed.content,
        createdBy: user.userId,
    });

    return json({ ok: true, data: created }, 201);
});

// List all users in the system, only for admin users.
const listUsersHandler = withAdmin(async () => {
    const users = await listUsers(pool);
    return json({ ok: true, data: users }, 200);
});

// Delete a user by id, only for admin users. Admin cannot delete own account to prevent accidental lockout.
const deleteUserHandler = withAdmin(async (req, user) => {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);

    const userId = parts.at(-1);

    if (!userId) {
        return json(
            { ok: false, error: { message: "Missing user id" } },
            400,
        );
    }

    if (userId === user.userId) {
        return json(
            { ok: false, error: { message: "Admin cannot delete own account" } },
            400,
        );
    }

    const deleted = await deleteUser(pool, userId);

    if (!deleted) {
        return json(
            { ok: false, error: { message: "User not found" } },
            404,
        );
    }

    return json({ ok: true }, 200);
});

type RouteKey = `${string} ${string}`;

const routes = new Map<RouteKey, Handler>([
    ["POST /api/auth/register", registerHandler],
    ["POST /api/auth/login", loginHandler],
    ["GET /api/notifications", getNotificationsHandler],
    ["POST /api/admin/notifications", createNotificationHandler],
    ["GET /api/admin/users", listUsersHandler],
]);

export async function router(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }
    
    // We could build a more complex routing system where we could include the delete route to the route mapping, but for simplicity we will just handle it separately here.
    if (req.method === "DELETE" && url.pathname.startsWith("/api/admin/users/")) {
        return await deleteUserHandler(req);
    }

    const key: RouteKey = `${req.method} ${url.pathname}`;
    const handler = routes.get(key);

    if (!handler) {
        return json({ ok: false, error: { message: "Not found" } }, 404);
    }

    return await handler(req);
}