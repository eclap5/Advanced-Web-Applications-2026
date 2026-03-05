import { hash, verify } from "@felix/bcrypt";
import type { Pool } from "@db/postgres";
import { generateJWT } from "../middleware/auth-middleware.ts";
import { createUser, findUserByEmail } from "../repositories/user-repository.ts";

export async function register(pool: Pool, email: string, password: string) {
    const existing = await findUserByEmail(pool, email);

    if (existing) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hash(password);

    await createUser(pool, {
        id: crypto.randomUUID(),
        email,
        passwordHash,
    });
}

export async function login(pool: Pool, email: string, password: string): Promise<string> {
    const user = await findUserByEmail(pool, email);

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const valid = await verify(password, user.passwordHash);

    if (!valid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = await generateJWT({ sub: user.id });

    return token;
}