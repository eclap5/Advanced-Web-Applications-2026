import { pool } from "./db/pool.ts";
import { json, corsHeaders } from "./util/response.ts";
// For A04 secure fix demo, uncomment and use these:
// import { hash, verify } from "@felix/bcrypt";

async function readJson(req: Request): Promise<unknown> {
    try {
        return await req.json();
    } catch {
        throw new Error("Invalid JSON in request body");
    }
}

function _readAuthUser(req: Request): { userId: string; email: string; role: string } | null {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    try {
        const token = authHeader.slice(7);
        return JSON.parse(atob(token));
    } catch {
        return null;
    }
}

function isStrongPassword(password: string): boolean {
    // INTENTIONALLY WEAK: only checks length
    return password.length >= 4;

    // SECURE VERSION: checks length, uppercase, lowercase, number, special char
    // const hasMinLength = password.length >= 8;
    // const hasUppercase = password.toLowerCase() !== password;
    // const hasLowercase = password.toUpperCase() !== password;
    // const hasNumber = [... password].some(char => char >= "0" && char <= "9");
    // const hasSpecialChar = [...password].some((c) => !/[a-zA-Z0-9]/.test(c));

    // NOSONAR
    // return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}



export async function router(req: Request): Promise<Response> {     // NOSONAR
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders(),
        });
    }

    try {
        // ---------------------------------------------------------------------
        // A02 SECURITY MISCONFIGURATION
        // Debug/config endpoint exposed publicly
        // ---------------------------------------------------------------------
        if (req.method === "GET" && url.pathname === "/api/debug/config") {
            return json({
                ok: true,
                environment: {
                    databaseUrl: Deno.env.get("DATABASE_URL"),
                    jwtSecret: "super-secret-demo-key",
                    mode: "development",
                },
            });
        }

        // ---------------------------------------------------------------------
        // A07 AUTHENTICATION FAILURES
        // Weak password policy + plaintext password storage
        // Also supports A04 CRYPTOGRAPHIC FAILURES
        // ---------------------------------------------------------------------
        if (req.method === "POST" && url.pathname === "/api/register") {
            const body = await readJson(req) as Record<string, unknown> | null;

            if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
                return json({ ok: false, error: "Invalid request body" }, 400);
            }

            const email = body.email.trim().toLowerCase();
            const password = body.password.trim();

            // INTENTIONALLY WEAK VALIDATION
            if (!isStrongPassword(password)) {
                return json({ ok: false, error: "Password must be at least 4 characters" }, 400);

                // SECURE VERSION:
                // return json({ ok: false, error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character" }, 400);
            }

            const id = crypto.randomUUID();

            const client = await pool.connect();

            try {
                // SECURE VERSION:
                // const passwordHash = await hash(password);
                await client.queryObject`
                    insert into users (id, email, password, role)
                    values (${id}::uuid, ${email}, ${password}, ${"user"})
                `;

                // SECURE VERSION:
                // await client.queryObject`
                //     insert into users (id, email, password, role)
                //     values (${id}::uuid, ${email}, ${passwordHash}, ${"user"})
                // `;
            }
            catch (error) {
                // INTENTIONALLY LEAKS DATABASE ERRORS TO CLIENT
                return json({ ok: false, error: String(error) }, 500);

                // SECURE VERSION:
                // console.error("Database error during registration:", error);
                // return json({ ok: false, error: "Internal server error" }, 500);
            } 
            finally {
                client.release();
            }

            return json({
                ok: true,
                data: {
                    id,
                    email,
                },
            }, 201);
        }

        // ---------------------------------------------------------------------
        // A07 AUTHENTICATION FAILURES
        // Reveals whether user exists
        // No hashing
        // No rate limiting
        // Fake session token
        // ---------------------------------------------------------------------
        if (req.method === "POST" && url.pathname === "/api/login") {
            const body = await readJson(req) as Record<string, unknown> | null;

            if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
                return json({ ok: false, error: "Invalid request body" }, 400);
            }

            const email = body.email.trim().toLowerCase();
            const password = body.password;

            const client = await pool.connect();

            try {
                const result = await client.queryObject<{
                    id: string;
                    email: string;
                    password: string;
                    role: string;
                }>`
                    select id, email, password, role
                    from users
                    where email = ${email}
                `;

                const user = result.rows[0];

                // INTENTIONALLY LEAKS USER EXISTENCE
                if (!user) {
                    return json({ ok: false, error: "User does not exist" }, 404);
                }

                // INTENTIONALLY PLAINTEXT PASSWORD CHECK
                if (user.password !== password) {
                    return json({ ok: false, error: "Wrong password" }, 401);
                }

                // SECURE VERSION:
                // if (!user) {
                //     return json({ ok: false, error: "Invalid email or password" }, 401);
                // }
                // const isValidPassword = await verify(password, user.password);
                // if (!isValidPassword) {
                //     return json({ ok: false, error: "Invalid email or password" }, 401);
                // }

                // INTENTIONALLY INSECURE "TOKEN"
                const token = btoa(JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                }));

                return json({
                    ok: true,
                    data: { token },
                });
            } finally {
                client.release();
            }
        }

        // ---------------------------------------------------------------------
        // A05 INJECTION
        // SQL injection via string concatenation
        // ---------------------------------------------------------------------
        if (req.method === "GET" && url.pathname === "/api/users/search") {
            const email = url.searchParams.get("email") ?? "";

            const client = await pool.connect();

            try {
                // INTENTIONALLY VULNERABLE
                const query = `
                    select id, email, role, password
                    from users
                    where email = '${email}'
                `;

                const result = await client.queryObject(query);

                // SECURE VERSION:
                // const result = await client.queryObject<{
                //     email: string;
                //     id: string;
                //     role: string;
                // }>`select id, email, role from users where email = ${email}`;

                return json({
                    ok: true,
                    data: result.rows,
                    executedQuery: query,   // In secure version remove this
                });
            } finally {
                client.release();
            }
        }

        // ---------------------------------------------------------------------
        // A01 BROKEN ACCESS CONTROL
        // Admin route trusts client-controlled query parameter
        // ---------------------------------------------------------------------
        if (req.method === "GET" && url.pathname === "/api/admin/audit") {
            const role = url.searchParams.get("role");

            // INTENTIONALLY BROKEN: trusts user-supplied role
            if (role !== "admin") {
                return json({ ok: false, error: "Forbidden" }, 403);
            }
            
            // SECURE VERSION:
            // const authUser = readAuthUser(req);
            // if (!authUser) {
            //     return json({ ok: false, error: "Unauthorized" }, 401);
            // }
            // if (authUser.role !== "admin") {
            //     return json({ ok: false, error: "Forbidden" }, 403);
            // }

            return json({
                ok: true,
                data: {
                    message: "Top secret admin audit log",
                    logs: [
                        "Deleted 4 users",
                        "Exported monthly report",
                        "Viewed all private notes",
                    ],
                },
            });
        }

        // ---------------------------------------------------------------------
        // A01 BROKEN ACCESS CONTROL
        // Any logged-in user can read any note by ID
        // "Authentication" is just base64 token from client
        // ---------------------------------------------------------------------
        if (req.method === "GET" && url.pathname.startsWith("/api/notes/")) {
            const noteId = url.pathname.split("/").pop();

            const authHeader = req.headers.get("authorization");

            if (!authHeader?.startsWith("Bearer ")) {
                return json({ ok: false, error: "Missing token" }, 401);
            }

            // INTENTIONALLY TRUSTS UNSIGNED TOKEN
            const token = authHeader.slice(7);
            const authUser = JSON.parse(atob(token));

            // SECURE VERSION:
            // const authUser = readAuthUser(req);
            // if (!authUser) {
            //     return json({ ok: false, error: "Unauthorized" }, 401);
            // }

            const client = await pool.connect();

            try {
                const result = await client.queryObject<{
                    id: string;
                    title: string;
                    content: string;
                    owner_id: string;
                }>`
                    select id, title, content, owner_id
                    from notes
                    where id = ${noteId}
                `;

                const note = result.rows[0];

                if (!note) {
                    return json({ ok: false, error: "Note not found" }, 404);
                }

                // SECURE VERSION:
                // const isOwner = note.owner_id === authUser.userId;
                // const isAdmin = authUser.role === "admin";
                // if (!isOwner && !isAdmin) {
                //     return json({ ok: false, error: "Forbidden" }, 403);
                // }

                // INTENTIONALLY BROKEN:
                // no ownership check, no role check
                return json({
                    ok: true,
                    currentUser: authUser,
                    data: note,
                });

            } finally {
                client.release();
            }
        }

        // ---------------------------------------------------------------------
        // A01 BROKEN ACCESS CONTROL
        // Anyone can delete any user
        // ---------------------------------------------------------------------
        if (req.method === "DELETE" && url.pathname.startsWith("/api/users/")) {
            // SECURE VERSION:
            // const authUser = readAuthUser(req);
            // if (!authUser) {
            //     return json({ ok: false, error: "Unauthorized" }, 401);
            // }
            // if (authUser.role !== "admin") {
            //     return json({ ok: false, error: "Forbidden" }, 403);
            // }
            
            const userId = url.pathname.split("/").pop();

            const client = await pool.connect();

            try {
                await client.queryObject`
                    delete from users
                    where id = ${userId}::uuid
                `;

                return json({
                    ok: true,
                    message: `User ${userId} deleted`,
                });
            } finally {
                client.release();
            }
        }

        return json({ ok: false, error: "Not found" }, 404);
    } catch (error) {
        // ---------------------------------------------------------------------
        // A02 SECURITY MISCONFIGURATION
        // Leaks internal error details to client
        // ---------------------------------------------------------------------
        return json({
            ok: false,
            error: String(error),
            stack: error instanceof Error ? error.stack : null,
        }, 500);

        // SECURE VERSION:
        // if (error instanceof Error) {
        //     console.error("Internal server error:", error);
        // }
        // return json({
        //     ok: false,
        //     error: "Internal server error",
        // }, 500);
    }
}