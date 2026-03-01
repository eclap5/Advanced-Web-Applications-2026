import { useEffect, useState } from "react";
import { fetchJoke, fetchSavedJokes, saveJoke } from "./api";
import type { Joke, SavedJoke } from "./types";
import Header from "./components/Header";
import CurrentJokeCard from "./components/CurrentJokeCard";
import SavedJokesList from "./components/SavedJokesList";
import ErrorBanner from "./components/ErrorBanner";

const REFRESH_MS = 10000;

export default function App() {
    const [current, setCurrent] = useState<Joke | null>(null);

    const [loadingJoke, setLoadingJoke] = useState(true);
    const [errorJoke, setErrorJoke] = useState("");

    const [saved, setSaved] = useState<SavedJoke[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [errorSaved, setErrorSaved] = useState("");

    const refreshSeconds = REFRESH_MS / 1000;

    async function loadCurrent(signal?: AbortSignal) {
        const joke = await fetchJoke(signal);
        setCurrent(joke);
    }

    async function loadSaved(signal?: AbortSignal) {
        const jokes = await fetchSavedJokes(signal);
        setSaved(jokes);
    }

    useEffect(() => {
        const controller = new AbortController();   // AbortController is a crucial tool for managing the lifecycle of async operations in React. This allows to abort ongoing fetch requests when needed.

        // Initial fetches
        setLoadingJoke(true);
        setErrorJoke("");
        loadCurrent(controller.signal)
            .catch((e) => {
                if (!controller.signal.aborted) setErrorJoke(e.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoadingJoke(false);
            });

        setLoadingSaved(true);
        setErrorSaved("");
        loadSaved(controller.signal)
            .catch((e) => {
                if (!controller.signal.aborted) setErrorSaved(e.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoadingSaved(false);
            });

        // Set up interval for refreshing the current joke
        // setInterval is a handy tool for performing repeated actions, however, it doesn't work well with async functions that can be aborted. In this case, 
        // we need to ensure that if the component unmounts or if the effect is re-run for any reason, 
        // we properly clean up the interval and abort any ongoing fetch operations to prevent memory leaks and avoid setting state on an unmounted component.
        const intervalId = setInterval(() => {
            loadCurrent(controller.signal).catch((e) => {
                if (!controller.signal.aborted) setErrorJoke(e.message);
            });
        }, REFRESH_MS);

        // Cleanup
        // Cleanup is important part of using useEffect, especially when dealing with asynchronous operations and intervals.
        // By returning a cleanup function, we ensure that when the component unmounts or when the effect is re-run (e.g., if dependencies change), 
        // we can abort any ongoing fetch operations and clear the interval to prevent memory leaks and avoid trying to update state on an unmounted component.
        return () => {
            controller.abort();
            clearInterval(intervalId);
        };
    }, []); // Dependency array should be explained to understand the way useEffect works. In this case, useEffect will run only when component is mounted.

    async function onNewJoke() {
        try {
            setErrorJoke("");
            setLoadingJoke(true);
            await loadCurrent();
        } catch (e: unknown) {
            setErrorJoke(e instanceof Error ? e.message : "Failed to fetch joke");
        } finally {
            setLoadingJoke(false);
        }
    }

    async function onSave() {
        if (!current) return;

        try {
            setErrorSaved("");
            await saveJoke({ text: current.text, category: current.category });
            await loadSaved();
        } catch (e: unknown) {
            setErrorSaved(e instanceof Error ? e.message : "Failed to save joke");
        }
    }

    return (
        <div className="container">
            <Header
                refreshSeconds={refreshSeconds}
                loadingJoke={loadingJoke}
                onNewJoke={onNewJoke}
                canSave={Boolean(current)}
                onSave={onSave}
            />

            {loadingJoke ? <div className="card">Loading joke…</div> : null}
            {errorJoke ? <ErrorBanner message={errorJoke} /> : null}

            {current && !loadingJoke ? <CurrentJokeCard joke={current} /> : null}

            <SavedJokesList
                jokes={saved}
                loading={loadingSaved}
                error={errorSaved}
            />
        </div>
    );
}