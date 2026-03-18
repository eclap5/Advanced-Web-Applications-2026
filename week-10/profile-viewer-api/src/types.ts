export interface GoogleProfile {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}

export interface OidcRequestState {
    state: string;
    nonce: string;
    codeVerifier: string;
    createdAt: number;
}