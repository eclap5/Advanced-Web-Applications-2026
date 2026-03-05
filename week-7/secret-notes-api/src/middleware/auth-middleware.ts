import { JWTPayload, jwtVerify, SignJWT } from "jose";

const JWT_SECRET_KEY = Deno.env.get("JWT_SECRET");

const secret = new TextEncoder().encode(JWT_SECRET_KEY);

export async function generateJWT(payload: JWTPayload): Promise<string> {
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
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
        const { payload } = await jwtVerify(token, secret);
        return payload.sub as string;
    } catch {
        return null;
    }
}