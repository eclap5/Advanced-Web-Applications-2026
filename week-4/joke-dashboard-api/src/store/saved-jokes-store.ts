/**
 * Similarly as we separated the fetching of jokes from the external API into a separate service, we can also separate the storage of saved jokes into a separate module.
 * While the jokes are saved to application runtime memory in this example, this @store module is mocking the database layer of the application.
*/

import type { SavedJoke } from "../types.ts";

const savedJokes: SavedJoke[] = [];

export function addJoke(joke: SavedJoke): void {
    savedJokes.push(joke);
}

export function getSortedJokes(): SavedJoke[] {
    return [...savedJokes].sort((a, b) => b.savedAt.localeCompare(a.savedAt)); // Sort by savedAt in descending order
}
