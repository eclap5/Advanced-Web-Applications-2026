export type User = {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
};

export type LoginResult = {
    token: string;
    user: Omit<User, "passwordHash"|"createdAt">;
};

export type AuthUser = Omit<User, "passwordHash"|"createdAt">;

export type RouteKey = `${string} ${string}`;
export type Handler = (req: Request) => Promise<Response>;
export type AuthedHandler = (req: Request, user: AuthUser) => Promise<Response>;