export interface Book {
    key: string;
    title: string;
    authorName: string[];
    firstPublishYear?: number;
    language: string[];
    coverId?: number;
    editionCount: number;
}

export interface SearchFilters {
    language: string;
    sortBy: "title" | "year";
    favoritesOnly: boolean;
}