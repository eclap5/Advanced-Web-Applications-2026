/**
 * Authentication middleware for handling JWT generation and verification.
 * Uses the "jose" library for JWT operations.
 * The secret key for signing JWTs is read from the environment variable "JWT_SECRET".
*/

import { JWTPayload, jwtVerify, SignJWT } from "jose";

const JWT_SECRET_KEY = Deno.env.get("JWT_SECRET");

const secret = new TextEncoder().encode(JWT_SECRET_KEY);

export async function generateJWT(payload: JWTPayload): Promise<string> {
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })   // Specify the signing algorithm, in this case HMAC with SHA-256
        .setIssuedAt()
        .setExpirationTime("2h")    // Set the token to expire in 2 hours
        .sign(secret);
    
    return jwt;
}

export async function requireAuth(req: Request): Promise<string | null> {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);

    try {
        const { payload } = await jwtVerify(token, secret);     // Verify the token and extract the payload
        return payload.sub as string;   // Return the "sub" claim from the payload, which typically contains the user ID
    } catch {
        return null;
    }
}