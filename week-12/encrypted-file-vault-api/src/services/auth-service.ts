import { verify, hash } from "@felix/bcrypt";
import type { Pool } from "@db/postgres";
import { createUser, findUserByEmail } from "../repositories/user-repository.ts";
import { signToken } from "../utils/jwt.ts";
import { LoginResult } from "../types.ts";

export async function registerUser(
    pool: Pool,
    email: string,
    password: string,
    inviteCode: string
): Promise<void> {
    if (inviteCode !== Deno.env.get("INVITE_CODE")) {
        throw new Error("Invalid invite code");
    }

    const existingUser = await findUserByEmail(pool, email);

    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    const passwordHash = await hash(password);

    await createUser(pool, {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        createdAt: new Date()
    });
}

export async function loginUser(
    pool: Pool,
    email: string,
    password: string,
): Promise<LoginResult> {
    const user = await findUserByEmail(pool, email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const valid = await verify(password, user.passwordHash);

    if (!valid) {
        throw new Error("Invalid email or password");
    }

    const token = await signToken({
        userId: user.id,
        email: user.email
    });

    const result: LoginResult = {
        token,
        user: { id: user.id, email: user.email }
    };

    return result;
}