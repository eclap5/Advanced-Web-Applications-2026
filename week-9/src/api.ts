import type { Book } from "./types";

const EXTERNAL_API_BASE = "https://openlibrary.org";

// This type represents the structure of the response from Open Library's search API
type OpenLibraryDoc = {
    key: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    language?: string[];
    cover_i?: number;
    edition_count?: number;
};

type OpenLibraryResponse = {
    docs: OpenLibraryDoc[];
};

export async function searchBooks(
    query: string,
    signal?: AbortSignal,
): Promise<Book[]> {
    const trimmed = query.trim();

    if (!trimmed) {
        return [];
    }

    const url = new URL(`${EXTERNAL_API_BASE}/search.json`);
    url.searchParams.set("q", trimmed);
    url.searchParams.set("limit", "24");

    const res = await fetch(url.toString(), { signal });

    if (!res.ok) {
        throw new Error(`Open Library request failed (${res.status})`);
    }

    const data: OpenLibraryResponse = await res.json();

    return data.docs.map((doc) => ({
        key: doc.key,
        title: doc.title ?? "Untitled",
        authorName: doc.author_name ?? ["Unknown author"],
        firstPublishYear: doc.first_publish_year,
        language: doc.language ?? [],
        coverId: doc.cover_i,
        editionCount: doc.edition_count ?? 0,
    }));
}

// Helper function to construct cover image URL from cover ID
export function getCoverUrl(coverId?: number): string | null {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}