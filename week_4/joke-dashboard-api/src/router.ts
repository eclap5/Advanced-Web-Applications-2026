import type { Joke } from "./types.ts";
import { fetchJokeFromExternalApi } from "./services/external-joke-serivce.ts";
import { addJoke, getSortedJokes } from "./store/saved-jokes-store.ts";

/**
 * Now when the client side code is running in different port, we need to define CORS headers in our API responses to allow the client to access the API.
 * CORS will be covered in more detail later in the course, but for now these can be briefly explained.
 * Allow-Origin: This header specifies which origins are allowed to access the resource. Setting it to "*" allows all origins.
 * Allow-Methods: This header specifies which HTTP methods are allowed when accessing the resource. In this case, we allow GET, POST and OPTIONS (for preflight requests).
 * Allow-Headers: This header specifies which HTTP headers can be used during the actual request. Here we allow "Content-Type" header, which is commonly used when sending JSON data in the request body.
*/ 
function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            ...corsHeaders()
        },
  });
}

async function readJson(req: Request): Promise<unknown | null> {
    try {
        return await req.json();
    } catch {
        return null;
    }
}

// When receiving data from the client, it is good practice to always validate it before assigning it directly to the application runtime. 
// This is to prevent any unexpected data from causing issues in the application.
function parseSaveBody(body: unknown): Joke | null {
    if (typeof body !== "object" || body === null) return null;

    const b = body as Record<string, unknown>;

    if (typeof b.text !== "string" || typeof b.category !== "string" || typeof b.id !== "string" || typeof b.fetchedAt !== "string") 
        return null;

    const text: string = b.text.trim();
    if (!text) return null;

    const category: string = b.category.trim();
    if (!category) return null;

    const id: string = b.id.trim();
    if (!id) return null;

    const fetchedAt: string | undefined = b.fetchedAt?.toString().trim();
    if (!fetchedAt) return null;

    const parsedDate = Date.parse(fetchedAt);
    if (Number.isNaN(parsedDate)) return null;

    return { text, category, id, fetchedAt };
}


// As in week 2, we separate the handling of different routes into different functions to keep the code organized and easier to read.
const handleJokeFetching = async (): Promise<Response> => {
    try {
        const joke = await fetchJokeFromExternalApi();
        return json({ ok: true, data: joke });
    } catch (error: unknown) {
        return json({ ok: false, error: error instanceof Error ? error.message : "Unknown error occurred" }, 500);
    }
};

const handleSavedJokesFetching = (): Response => {
    const data = getSortedJokes();
    return json({ ok: true, data });
};

const handleJokeSaving = async (req: Request): Promise<Response> => {
    try {
        const body = await readJson(req);
        const parsedBody = parseSaveBody(body);

        if (!parsedBody) {
            return json({ ok: false, error: "Invalid save joke request body" }, 400);
        }
        const newJoke: Joke = {
            text: parsedBody.text,
            category: parsedBody.category,
            id: parsedBody.id,
            fetchedAt: parsedBody.fetchedAt
        };
        addJoke(newJoke);
        return json({ ok: true, data: newJoke }, 201);
    } catch (error: unknown) {
        return json({ ok: false, error: error instanceof Error ? error.message : "Unknown error occurred" }, 500);
    }
};

export async function router(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Preflight for CORS
    // When the client makes a cross-origin request, it first sends an OPTIONS request to the server to check if the actual request is safe to send. 
    // The server needs to respond to this preflight request with the appropriate CORS headers to indicate that the actual request is allowed.
    // Return 204 status code indicating that the preflight was successful and no actual content is passed with preflight response.
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }
    
    if (url.pathname === "/api/joke" && req.method === "GET") {
        return await handleJokeFetching();
    }

    if (url.pathname === "/api/saved" && req.method === "GET") {
        return handleSavedJokesFetching();
    }

    if (url.pathname === "/api/saved" && req.method === "POST") {
        return handleJokeSaving(req);
    }

    return json({ ok: false, error: "Not Found" }, 404);
}