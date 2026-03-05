export interface User {
    id: string;
    email: string;
    passwordHash: string;
}

export interface Note {
    id: string;
    content: string;
}