export interface FetchedJoke {
    externalId: string;
    category: string;
    text: string;
    fetchedAt: string;
}

export interface SavedJoke {
    id: string;
    category: string;
    text: string;
    savedAt: string;
}