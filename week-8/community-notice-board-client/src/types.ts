export interface Notification {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    createdBy: string;
}

export interface PublicUser {
    id: string;
    email: string;
    role: "user" | "admin";
}

export interface JwtPayload {
    sub: string;
    email: string;
    role: "user" | "admin";
    exp: number;
    iat: number;
}

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: { message: string } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;