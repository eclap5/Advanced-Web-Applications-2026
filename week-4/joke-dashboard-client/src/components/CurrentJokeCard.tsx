import type { Joke } from "../types";

type Props = {
    joke: Joke;
};

export default function CurrentJokeCard({ joke }: Props) {
    return (
        <div className="card">
            <div className="meta">
                <span className="tag">{joke.category}</span>
                <span className="metaText">
                    Fetched at {new Date(joke.fetchedAt).toLocaleTimeString()}
                </span>
            </div>

            <pre className="joke">{joke.text}</pre>
        </div>
    );
}