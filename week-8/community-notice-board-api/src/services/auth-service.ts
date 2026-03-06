import { verify, hash } from "@felix/bcrypt";

import type { Pool } from "@db/postgres";
import { createUser, findUserByEmail } from "../repositories/user-repository.ts";
import { signToken } from "../util/jwt.ts";

export async function registerUser(
    pool: Pool,
    email: string,
    password: string,
): Promise<void> {
    const existing = await findUserByEmail(pool, email);

    if (existing) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hash(password);

    await createUser(pool, {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        role: "user",
    });
}

export async function loginUser(
    pool: Pool,
    email: string,
    password: string,
): Promise<string> {
    const user = await findUserByEmail(pool, email);

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const valid = await verify(password, user.passwordHash);

    if (!valid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    return await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
}