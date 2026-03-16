export interface Book {
    key: string;
    title: string;
    authorName: string[];
    firstPublishYear?: number;
    coverId?: number;
    editionCount: number;
}

export interface SearchControls {
    sortBy: "title" | "year";
}