import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNotes } from "../api";
import type { Note } from "../types";
import { clearToken } from "../auth";

export default function NotesPage() {
    const navigate = useNavigate();     // useNavigate hook from react-router-dom to programmatically navigate between pages.

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchNotes();
                if (!controller.signal.aborted) {
                    setNotes(data);
                }
            } catch (err) {
                if (controller.signal.aborted) return;

                const msg = err instanceof Error ? err.message : "Failed to load notes";

                if (msg === "UNAUTHORIZED") {
                    clearToken();
                    navigate("/login", { replace: true });
                    return;
                }

                setError(msg);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => controller.abort();
    }, [navigate]);     // Add navigate to the dependency array of useEffect, since we are using it inside the effect. 
    // This is important to avoid potential issues with stale closures, and to ensure that the effect runs correctly when the navigate function changes (which can happen if the component is re-rendered).

    return (
        <div className="card">
            <h2>Secret Notes</h2>
            <p className="muted">These notes are only visible to authenticated users.</p>

            {loading && <div className="muted">Loading…</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && (
                <ul className="notes">
                    {notes.map((n) => (
                        <li key={n.id} className="noteItem">{n.content}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}