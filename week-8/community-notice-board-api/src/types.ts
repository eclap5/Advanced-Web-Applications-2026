/**
 * It may be a bit confusing of why we are using multiple similar types, i.e. User, PublicUser and AuthUser, so let's clarify that first:
 * - User basically represents the Entity of a User. It has the properties that are stored in the database and it should never leave the backend.
 * - PublicUser represents the DTO of a User. It has the properties that we want to expose to the client, so it can be used in the API responses.
 * - AuthUser represents the authenticated user that we get from the JWT token. It has the properties that we need to identify the user and their permissions.
 * 
 * Additionally we have the AuthBody and CreateNotificationBody types that represent the expected shape of the request bodies for the authentication and notification creation endpoints.
 * These are used to validate the incoming data.
 * 
 * Lastly, the Handler and AuthedHandler types represent the shape of our request handlers. 
 * Handler is for public endpoints that don't require authentication, while AuthedHandler is for protected endpoints that require authentication and receive the authenticated user as a parameter.
*/

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: "user" | "admin";
}

export interface PublicUser {
    id: string;
    email: string;
    role: "user" | "admin";
}

export interface Notification {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    createdBy: string;
}

export interface AuthUser {
    userId: string;
    email: string;
    role: "user" | "admin";
}

export type Handler = (req: Request) => Promise<Response>;
export type AuthedHandler = (req: Request, user: AuthUser) => Promise<Response>;

export interface AuthBody {
    email: string;
    password: string;
}

export interface CreateNotificationBody {
    title: string;
    content: string;
}