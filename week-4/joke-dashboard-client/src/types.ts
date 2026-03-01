// Create simple types to be used in the front-end code.

export interface Joke {
    id: string;
    category: string;
    text: string;
    fetchedAt: string;
}

export type SavedJoke = Joke;

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: { message: string } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;