/**
 * This file contains a custom React hook for searching books using the Open Library API.
 * This is a handy example of how to create a custom hook that manages asynchronous data fetching, loading states, and error handling in a clean and reusable way.
 * This way we don't have to repeat the same logic in multiple components that need to search for books, and we can keep our components focused on rendering the UI based on the data provided by this hook.
 * This could be made generic and therefore used in a more wider context with fetching data from any API. That kind of custom hook may come very handy in, for example, the project work.
*/

import { useEffect, useState } from "react";
import { searchBooks } from "../api";
import type { Book } from "../types";

export function useBookSearch(query: string) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * UseEffect comes very handy in this kind of scenarios where we want to perform side effects (like data fetching) in response to changes in state or props (in this case, the search query).
     * In this way the user doesn't have to explicitly trigger the search (e.g. by clicking a button) - the search will be performed automatically whenever the query changes, 
     * with built-in debouncing and cancellation logic to optimize the user experience and avoid unnecessary API calls.
    */
    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed.length < 2) {
            setBooks([]);
            setError("");
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = globalThis.setTimeout(async () => {
            setLoading(true);
            setError("");

            try {
                const data = await searchBooks(trimmed, controller.signal);
                if (!controller.signal.aborted) {
                    setBooks(data);
                }
            } catch (e) {
                if (!controller.signal.aborted) {
                    setError(e instanceof Error ? e.message : "Failed to fetch books");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 400);

        return () => {
            controller.abort();
            globalThis.clearTimeout(timeoutId);
        };
    }, [query]);

    return {
        books,
        loading,
        error,
    };
}