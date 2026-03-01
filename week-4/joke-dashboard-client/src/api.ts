import type { Joke, SavedJoke, ApiResponse } from "./types";

// URL for the API server.
const BASE_URL = "http://localhost:8000";

async function readApi<T>(res: Response): Promise<ApiResponse<T>> {
    return (await res.json()) as ApiResponse<T>;
}

export async function fetchJoke(signal?: AbortSignal): Promise<Joke> {
    const res = await fetch(`${BASE_URL}/api/joke`, { signal });
    const payload = await readApi<Joke>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}

export async function fetchSavedJokes(signal?: AbortSignal): Promise<SavedJoke[]> {
    const res = await fetch(`${BASE_URL}/api/saved`, { signal });
    const payload = await readApi<SavedJoke[]>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}

// This is a good point of introducing some TypeScript utility types, such as Pick, Omit, Partial, etc.
// In this case we can use pick to pick only the text and category properties, as other relevant data is generated in the back-end.
export async function saveJoke(joke: Pick<Joke, "text" | "category">): Promise<SavedJoke> {
    const res = await fetch(`${BASE_URL}/api/saved`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(joke),
    });

    const payload = await readApi<SavedJoke>(res);

    if (!res.ok || !payload.ok) {
        throw new Error(payload.ok ? `HTTP ${res.status}` : payload.error.message);
    }

    return payload.data;
}