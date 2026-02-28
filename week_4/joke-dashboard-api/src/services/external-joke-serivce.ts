/**
 * At this point we can start to gradually shift the architecture towards a more service-oriented design and layered architecture.
 * During this week the architecture is not yet covered in depth, but we can start by separating the fetching of jokes from the external API into a separate service. 
 * This way, if we need to change the external API or add additional logic related to fetching jokes, we can do it in one place without affecting the rest of the application.
 * 
 * Point is that the application core logic should be separated from the routing. 
*/

import { Joke } from "../types.ts";

const EXTERNAL_JOKE_API = "https://v2.jokeapi.dev/joke/Programming?type=single&safe=true";

export async function fetchJokeFromExternalApi(): Promise<Joke> {
    const response: Response = await fetch(EXTERNAL_JOKE_API);
    if (!response.ok) {
        throw new Error(`Failed to fetch joke from external API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`External API returned an error: ${data.message}`);
    }

    const joke: Joke = {
        id: crypto.randomUUID(),    // As we are saving the joke in our system, we must generate our own ID for it.
        category: data.category,
        text: data.joke,
        fetchedAt: new Date().toISOString()
    };

    return joke;
}