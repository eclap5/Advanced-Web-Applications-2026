export type User = {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    encryptionKeyFingerprint?: string | null;
};

export type LoginResult = {
    token: string;
    user: {
        id: string;
        email: string;
        hasEncryptionKey: boolean;
    };
};

export type AuthUser = {
    id: string;
    email: string;
};

export type StoredFile = {
    id: string;
    ownerId: string;
    originalFilename: string;
    blobName: string;
    contentType: string;
    sizeBytes: number;
    encryptionAlgorithm: string;
    encryptionIv: string;
    createdAt: string;
};

export type JwtPayload = {
    sub: string;
    email: string;
};

export type RouteKey = `${string} ${string}`;
export type Handler = (req: Request) => Promise<Response>;
export type AuthedHandler = (req: Request, user: AuthUser) => Promise<Response>;