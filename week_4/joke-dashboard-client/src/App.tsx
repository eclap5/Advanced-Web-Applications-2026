import { useEffect, useState } from "react";
import { fetchJoke, fetchSavedJokes, saveJoke } from "./api";
import type { Joke, SavedJoke } from "./types";
import Header from "./components/Header";
import CurrentJokeCard from "./components/CurrentJokeCard";
import SavedJokesList from "./components/SavedJokesList";
import ErrorBanner from "./components/ErrorBanner";

const REFRESH_MS = 10000;

export default function App() {
    // 
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
        const controller = new AbortController();

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

        // Poll jokes only (saved list changes only when user saves)
        const intervalId = setInterval(() => {
            loadCurrent(controller.signal).catch((e) => {
                if (!controller.signal.aborted) setErrorJoke(e.message);
            });
        }, REFRESH_MS);

        // Cleanup
        return () => {
            controller.abort();
            clearInterval(intervalId);
        };
    }, []);

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