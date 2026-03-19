import { jwtVerify, SignJWT } from "jose";
import { AuthUser } from "../types.ts";

const SECRET = new TextEncoder().encode(Deno.env.get("JWT_SECRET"));

if (!SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}

export async function signToken(user: {
    userId: string;
    email: string;
}): Promise<string> {
    return await new SignJWT({
        email: user.email
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user.userId)
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser> {
    const { payload } = await jwtVerify(token, SECRET);

    return {
        id: String(payload.sub),
        email: String(payload.email)
    };
}