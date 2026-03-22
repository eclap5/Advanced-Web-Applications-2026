import { pool } from "./db/pool.ts";
import { loginUser, registerUser, setUserEncryptionKeyFingerprint } from "./services/auth-service.ts";
import { findUserById } from "./repositories/user-repository.ts";
import type { AuthUser, Handler, LoginResult, RouteKey } from "./types.ts";
import { corsHeaders, json } from "./utils/response.ts";
import { withAuth } from "./middleware/auth-middleware.ts";
import { createEncryptedFile, getEncryptedFileForDownload, listUserFiles } from "./services/file-service.ts";

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

const dashboardHandler = withAuth(async (_req: Request, user: AuthUser) => {
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

const getFilesHandler = withAuth(async (_req: Request, user: AuthUser) => {
    try {
        const files = await listUserFiles(pool, user);

        return json({
            ok: true,
            data: files.map((file) => ({
                id: file.id,
                originalFilename: file.originalFilename,
                contentType: file.contentType,
                sizeBytes: file.sizeBytes,
                encryptionAlgorithm: file.encryptionAlgorithm,
                encryptionIv: file.encryptionIv,
                createdAt: file.createdAt,
            })),
        }, 200);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return json({ ok: false, error: { message: "Unauthorized" } }, 401);
        }

        return json(
            { ok: false, error: { message: "Failed to fetch files" } },
            500,
        );
    }
});

const postFilesHandler = withAuth(async (req: Request, user: AuthUser): Promise<Response> => {
    try {
        const formData = await req.formData();

        const file = formData.get("file");
        const originalFilename = formData.get("originalFilename");
        const contentType = formData.get("contentType");
        const sizeBytes = formData.get("sizeBytes");
        const encryptionAlgorithm = formData.get("encryptionAlgorithm");
        const encryptionIv = formData.get("encryptionIv");
        const fingerprint = formData.get("fingerprint");

        if (
            !(file instanceof File) ||
            typeof originalFilename !== "string" ||
            typeof contentType !== "string" ||
            typeof sizeBytes !== "string" ||
            typeof encryptionAlgorithm !== "string" ||
            typeof encryptionIv !== "string" ||
            typeof fingerprint !== "string"
        ) {
            return json(
                { ok: false, error: { message: "Invalid upload form data" } },
                400,
            );
        }

        const encryptedBytes = new Uint8Array(await file.arrayBuffer());

        const createdFile = await createEncryptedFile(pool, user, {
            encryptedBytes,
            originalFilename,
            contentType,
            sizeBytes: Number(sizeBytes),
            encryptionAlgorithm,
            encryptionIv,
            fingerprint,
        });

        return json({
            ok: true,
            data: {
                id: createdFile.id,
                originalFilename: createdFile.originalFilename,
            },
        }, 201);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === "Unauthorized") {
                return json({ ok: false, error: { message: "Unauthorized" } }, 401);
            }

            if (
                error.message === "Provided encryption key fingerprint does not match user account." ||
                error.message === "Encryption key fingerprint is not configured for user."
            ) {
                return json({ ok: false, error: { message: error.message } }, 403);
            }
        }

        throw error;
    }
});

const downloadFileHandler = withAuth(async (req: Request, user: AuthUser): Promise<Response> => {
    try {
        const url = new URL(req.url);
        const downloadPathPattern = /^\/api\/files\/([^/]+)\/download$/;
        const match = downloadPathPattern.exec(url.pathname);
        const fileId = match?.[1];

        if (!fileId) {
            return json(
                { ok: false, error: { message: "Invalid file id" } },
                400,
            );
        }

        const fingerprint = req.headers.get("X-Key-Fingerprint");

        if (!fingerprint) {
            return json(
                { ok: false, error: { message: "Missing key fingerprint" } },
                400,
            );
        }

        const result = await getEncryptedFileForDownload(
            pool,
            user,
            fileId,
            fingerprint,
        );

        const responseBytes = new Uint8Array(result.encryptedBytes.byteLength);
        responseBytes.set(result.encryptedBytes);

        return new Response(responseBytes.buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "X-Original-Filename": result.metadata.originalFilename,
                "X-Content-Type": result.metadata.contentType,
                "X-Encryption-Iv": result.metadata.encryptionIv,
                ...corsHeaders(),
            },
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === "Unauthorized") {
                return json({ ok: false, error: { message: "Unauthorized" } }, 401);
            }

            if (error.message === "File not found.") {
                return json({ ok: false, error: { message: "File not found" } }, 404);
            }

            if (
                error.message === "Provided encryption key fingerprint does not match user account." ||
                error.message === "Encryption key fingerprint is not configured for user."
            ) {
                return json({ ok: false, error: { message: error.message } }, 403);
            }
        }

        return json(
            { ok: false, error: { message: "Failed to download file" } },
            500,
        );
    }
});
    

const routes = new Map<RouteKey, Handler>([
    ["POST /api/auth/register", registerHandler],
    ["POST /api/auth/login", loginHandler],
    ["POST /api/auth/onboarding", onboardingHandler],
    ["GET /api/auth/dashboard", dashboardHandler],
    ["GET /api/files", getFilesHandler],
    ["POST /api/files", postFilesHandler],
]);

export async function router(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);

        if (req.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders() });
        }

        if (req.method === "GET" && url.pathname.startsWith("/api/files/download/")) {
            return await downloadFileHandler(req);
        }

        if (req.method === "GET" && url.pathname.startsWith("/api/files/") && url.pathname.endsWith("/download")) {
            return await downloadFileHandler(req);
        }

        const key: RouteKey = `${req.method} ${url.pathname}`;
        const handler = routes.get(key);

        if (!handler) {
            return json({ ok: false, error: { message: "Not found" } }, 404);
        }

        return await handler(req);
    } catch (error: unknown) {
        console.error("Unhandled router error:", error);
        return json(
            { ok: false, error: { message: "Internal server error" } },
            500,
        );
    }
}