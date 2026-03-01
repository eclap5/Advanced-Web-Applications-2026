import type { SavedJoke } from "../types";

type Props = {
    jokes: SavedJoke[];
    loading: boolean;
    error: string;
};

export default function SavedJokesList({ jokes, loading, error }: Props) {
    return (
        <div className="card">
            <h2>Saved jokes (from backend)</h2>

            {loading ? <div className="muted">Loading saved jokes…</div> : null}
            {error ? <div className="errorBox">Error: {error}</div> : null}

            {!loading && jokes.length === 0 ? (
                <div className="muted">
                    No saved jokes yet. Click <strong>Save</strong> on a joke above.
                </div>
            ) : null}

            <ul className="list">
                {jokes.map((j) => (
                    <li key={j.id} className="rowSaved">
                        <div className="rowTop">
                            <span className="small">
                                {new Date(j.fetchedAt).toLocaleTimeString()}
                            </span>
                            <span className="tag">{j.category}</span>
                        </div>
                        <div className="savedText">{j.text.replaceAll("\n", " ")}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}