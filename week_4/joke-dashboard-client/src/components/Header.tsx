type Props = {
    refreshSeconds: number;
    loadingJoke: boolean;
    onNewJoke: () => void;
    canSave: boolean;
    onSave: () => void;
};

export default function Header({
    refreshSeconds,
    loadingJoke,
    onNewJoke,
    canSave,
    onSave,
}: Props) {
    return (
        <header className="header">
            <div>
                <h1>Joke Dashboard</h1>
                <p className="sub">
                    Fetch on mount + polling every {refreshSeconds}s + manual refresh + save to backend
                </p>
            </div>

            <div className="headerActions">
                <button className="btn" onClick={onNewJoke} disabled={loadingJoke}>
                    New joke
                </button>
                <button className="btn" onClick={onSave} disabled={!canSave}>
                    Save
                </button>
            </div>
        </header>
    );
}