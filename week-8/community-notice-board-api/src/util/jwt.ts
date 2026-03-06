/**
 * For this week we will separate the repetitive JWT token operations to a utility file.
 * This is because as we are now signing the token in multiple locations, we don't want to includet the signing logic in the middleware.
 * Middleware's purpose is to only decide whether the request is authenticated and valid to continue or not.
 * This way we could also extend the token operations, for example to include token refreshing, etc. 
*/

import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
    Deno.env.get("JWT_SECRET") ?? "dev-secret",
);

export async function signToken(user: {
    userId: string;
    email: string;
    role: "user" | "admin";
}): Promise<string> {
    return await new SignJWT({
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user.userId)
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(SECRET);
}

export async function verifyToken(token: string) {
    const { payload } = await jwtVerify(token, SECRET);

    return {
        userId: String(payload.sub),
        email: String(payload.email),
        role: payload.role as "user" | "admin",
    };
}