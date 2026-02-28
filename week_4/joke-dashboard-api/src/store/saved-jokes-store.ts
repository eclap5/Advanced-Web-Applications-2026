/**
 * Similarly as we separated the fetching of jokes from the external API into a separate service, we can also separate the storage of saved jokes into a separate module.
 * While the jokes are saved to application runtime memory in this example, this @store module is mocking the database layer of the application.
*/

import type { Joke } from "../types.ts";

const savedJokes: Joke[] = [];

export function addJoke(joke: Joke): void {
    savedJokes.push(joke);
}

export function getSortedJokes(): Joke[] {
    return [...savedJokes].sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt)); // Sort by fetchedAt in descending order
}
