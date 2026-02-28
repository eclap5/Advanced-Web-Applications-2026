# Wiring React front-end with Deno back-end
In this week we will not introduce that much of a new concept, but demonstrate how the React front-end is used with Deno back-end. Only new thing will be `useEffect` hook, and asynchronous fetching from the API. Back-end will focus on structuring the code and strenghtening the knowledge of API development. 
The application created during this demo will be a simple Joke Dashboard application, where we will fetch jokes from an external API and process them through our back-end, and then display them on the front-end. We will also add a feature to save jokes to the back-end, and display saved jokes on the front-end. 

# Week 4 Walkthrough

## 1) Implement the back-end first (`joke-dashboard-api`)

1. Start from types in `src/types.ts`:
	- Define `FetchedJoke` (what comes from external API).
	- Define `SavedJoke` (what we store in our own API).
2. Implement external API service in `src/services/external-joke-serivce.ts`:
	- Map external response into `FetchedJoke`.
3. Implement in-memory store in `src/store/saved-jokes-store.ts`:
	- `addJoke` to store jokes.
	- `getSortedJokes` sorted by newest `savedAt` first.
    - This is a simple version for demonstration. Later on this will be replaced by database layer.
4. Implement routing in `src/router.ts`:
	- `GET /api/joke` → fetch from external service.
	- `GET /api/saved` → return saved jokes.
	- `POST /api/saved` → validate body, generate `id` + `savedAt`, save.
	- Add CORS headers and `OPTIONS` preflight handling.
5. Wire server in `src/main.ts` and run:
	- `deno task dev` (inside `joke-dashboard-api`).
6. Quick API checks before touching the front-end:
	- `GET /api/joke` returns one fetched joke.
	- `POST /api/saved` saves a joke.
	- `GET /api/saved` returns saved list in descending time order.

## 2) Implement the front-end after API is working (`joke-dashboard-client`)

1. Define front-end types in `src/types.ts` for API payloads.
2. Implement API wrapper in `src/api.ts`:
	- `fetchJoke`, `fetchSavedJokes`, `saveJoke`.
3. Build UI components in `src/components/`:
	- Header/actions, current joke card, saved list, error banner.
4. Compose state and effects in `src/App.tsx`:
	- Initial load for current joke + saved jokes.
	- Periodic refresh of current joke with `setInterval`.
	- Save flow and list refresh after saving.
	- Separate loading/error state for current joke and saved jokes.
5. Run front-end:
    - `deno task dev`

## 3) Checklist

1. Run API first (`deno task dev`), then client (`npm run dev`).
2. Show normal flow:
	- New joke fetch works.
	- Save joke works.
	- Saved jokes list updates.
3. Show loading and error states intentionally:
	- Stop the API server while client is open.
	- Trigger actions (fetch new joke / load saved jokes).
	- Confirm loading indicators and error messages are shown.
4. Restart API and show recovery:
	- Fetch succeeds again.
	- Save/list operations work again.
